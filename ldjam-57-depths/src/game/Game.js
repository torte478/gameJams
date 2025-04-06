import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Player from "./Player.js";
import Garbage from "./Garbage.js";
import Tools from "./Tools.js";
import Dumpster from "./Dumpster.js";
import Trigger from "./Trigger.js";
import BucketFactory from "./BucketFactory.js";
import MyStaticTime from "./MyStaticTime.js";
import Lights from "./Lights.js";
import Graphics from "./Graphics.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Player} */
  _player;

  /** @type {Garbage} */
  _garbage;

  /** @type {Tools} */
  _tools;

  /** @type {Phaser.Tilemaps.TilemapLayer} */
  _mapLayer;

  /** @type {Dumpster[]} */
  _dumpsters = [];

  /** @type {BucketFactory[]} */
  _bucketFactories = [];

  /** @type {Lights} */
  _lights;

  /** @type {Phaser.Sound.HTML5AudioSound} */
  _themeSound;

  /** @type {Phaser.Sound.HTML5AudioSound} */
  _ambientSound;

  constructor() {
    const me = this;

    me._player = new Player();
    const map = me._initTilemap();
    me._lights = new Lights(map);

    me._graphics = new Graphics();
    me._garbage = new Garbage(
      me._player.toGameObject(),
      me._mapLayer,
      me._graphics
    );

    me._tools = new Tools(
      me._garbage,
      me._player,
      me._lights,
      map,
      me._mapLayer,
      me._graphics
    );
    me._tools._superRef = me;

    Here._.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    Here._.sound.pauseOnBlur = true;

    me._themeSound = Here._.sound.add("sound", {
      loop: -1,
      config: { volume: Config.Sound.MainMaxVolume },
    });
    me._ambientSound = Here._.sound.add("ambient", {
      loop: -1,
      config: { volume: Config.Sound.AmbientMinVolume },
    });

    me._ambientSound.play();
    me._themeSound.play();

    const camera = Here._.cameras.main;
    camera
      .setBackgroundColor(0xe2f0f7)
      .startFollow(me._player.toGameObject())
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels)
      .setRoundPixels(true);

    // ----

    Here._.input.on("pointerdown", me._onPointerDown, me);

    // ----

    me._createTutorial();
    me._initDungeon();

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 700, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);
    });
  }

  update(timeSec, deltaSec) {
    const me = this;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    ) {
      Here._.scene.restart({ isRestart: true });
    }

    MyStaticTime.time = timeSec;

    const playerCursorPos = me._player.toMousePos();

    if (!MyStaticTime.isGameOver) {
      const createSpotAngle = me._player.update(deltaSec);

      if (createSpotAngle != null)
        me._garbage.createStep(
          me._player.toGameObject().x,
          me._player.toGameObject().y,
          createSpotAngle
        );

      me._tools.update();
      for (let i = 0; i < me._dumpsters.length; ++i)
        me._dumpsters[i].update(playerCursorPos);
      for (let i = 0; i < me._bucketFactories.length; ++i)
        me._bucketFactories[i].update(timeSec);
      me._updateSoundVolume();
    }

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;
      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `crs: ${playerCursorPos.x | 0} ${playerCursorPos.y | 0}\n` +
        `snd: ${me._themeSound.detune | 0}`;

      me._log.setText(text);
    });
  }

  _onPointerDown() {
    const me = this;

    Here._.input.mouse.requestPointerLock();

    me._tools.onPointerDown(me._player.toMousePos(), me._player.toGameObject());
  }

  _initTilemap() {
    const me = this;

    const tilemap = Here._.make.tilemap({
      key: "map",
      tileWidth: Consts.Unit.Big,
      tileHeight: Consts.Unit.Big,
    });
    const tileset = tilemap.addTilesetImage("wall");
    me._mapLayer = tilemap.createLayer(0, tileset, 0, 0);
    me._mapLayer.setDepth(Consts.Depth.Floor);

    tilemap.setCollision(Config.Tiles.Walls);
    Here._.physics.add.collider(me._player.toGameObject(), me._mapLayer);

    return tilemap;
  }

  _createTutorial() {
    const me = this;

    Here._.add
      .image(605, 500, "title")
      .setDepth(Consts.Depth.Floor)
      .setScale(2);

    me._createText(150, 1050, "Use hand (1)\nto pick up trash");

    for (let i = 0; i < 6; ++i)
      for (let j = 0; j < 2; ++j)
        me._garbage.createGarbage(500 + j * 50, 1025 + i * 50);

    me._createText(900, 1050, "Use mop (2)\nto clean spots");

    for (let i = 0; i < 6; ++i)
      me._garbage.createSpot(1225, 1025 + i * 50, true);

    for (let i = 0; i < 6; ++i)
      me._garbage.createSpot(1375, 1025 + i * 50, true);

    me._garbage.createGarbageWall(1200, 900);
    me._garbage.createGarbageWall(1300, 900);
    me._garbage.createGarbageWall(1400, 900);

    me._garbage.createGarbageWall(1200, 1300);
    me._garbage.createGarbageWall(1300, 1300);
    me._garbage.createGarbageWall(1400, 1300);

    new Trigger(
      me._player,
      100,
      900,
      200,
      100,
      () => {
        me._createText(1550, 1050, "Use bucket\nto clean the mop");
        me._createText(
          1550,
          1150,
          "Buckets can be\npicked up by hand (1)",
          true
        );

        me._bucketFactories.push(new BucketFactory(1925, 1225, me._garbage));

        me._dumpsters.push(
          new Dumpster(1850, 500, me._garbage, me._tools, me._graphics)
        );

        me._createText(1720, 750, "Dispose trash\nto gain mana");
        me._createText(
          1500,
          200,
          "Bags can also\nbe picked up\nby hand (1)",
          true
        );

        me._garbage.createBag(1850, 680, false, false);

        for (let i = 0; i < 4; ++i)
          for (let j = 0; j < 4; ++j)
            me._garbage.createGarbage(1800 + j * 50, 125 + i * 50);

        me._createText(1208, 450, "Use fireball (3)\nto break\ntrash walls");
      },
      me
    );
  }

  _createText(x, y, text, small) {
    const me = this;

    Here._.add
      .text(x, y, text, {
        color: "#428aa7",
        fontSize: !!small ? 24 : 36,
        fontFamily: "Arial Black",
      })
      .setDepth(Consts.Depth.Floor);
  }

  _initDungeon() {
    const me = this;

    // items

    Here._.add.image(1000, 1575, "title").setDepth(Consts.Depth.Floor);
    Here._.add.image(1000, 2000, "arch").setDepth(Consts.Depth.UpperPlayer);

    me._dumpsters.push(
      new Dumpster(800, 1800, me._garbage, me._tools, me._graphics),
      new Dumpster(600, 5100, me._garbage, me._tools, me._graphics)
    );

    me._bucketFactories.push(
      new BucketFactory(1200, 1800, me._garbage),
      new BucketFactory(800, 5500, me._garbage)
    );

    me._createText(1700, 2900, "Burn the firewood\nfor dungeon light", true);

    // wall

    // me._garbage.createGarbageWall(700, 2300);
    // me._garbage.createGarbageWall(700, 2400);

    // me._garbage.createGarbageWall(100, 2800);
    // me._garbage.createGarbageWall(200, 2800);

    // me._garbage.createGarbageWall(1400, 2800);
    // me._garbage.createGarbageWall(1400, 2900);

    // me._garbage.createGarbageWall(100, 5250);
    // me._garbage.createGarbageWall(200, 5250);
    // me._garbage.createGarbageWall(300, 5250);
    // me._garbage.createGarbageWall(400, 5250);

    // me._garbage.createGarbageWall(950, 5600);
    // me._garbage.createGarbageWall(950, 5700);
    // me._garbage.createGarbageWall(1050, 5600);
    // me._garbage.createGarbageWall(1050, 5700);
    // me._garbage.createGarbageWall(1150, 5600);
    // me._garbage.createGarbageWall(1150, 5700);

    // // garbage

    me._addDungeonGarbage(1125, 2350, 1875, 2550, 20, 10);
    // me._addDungeonGarbage(1770, 2650, 1930, 3080, 20, 10);
    // me._addDungeonGarbage(160, 2300, 600, 2750, 20, 10);

    // me._addDungeonGarbage(140, 3300, 360, 4500, 20, 10);

    // me._addDungeonGarbage(140, 5450, 715, 5850, 40, 15);

    // humpscare
    me._garbage.createStep(1800, 3600, 90, true);
    me._garbage.createStep(1830, 3700, 90, true);
    me._garbage.createStep(1810, 3800, 90, true);
    me._garbage.createStep(1840, 3900, 90, true);

    Here._.add.image(2000, 5900, "wall", 2).setDepth(Consts.Depth.UpperPlayer);

    Here._.add
      .image(2010, 5850, "wall", 2)
      .setDepth(Consts.Depth.UpperPlayer)
      .setAngle(30);

    Here._.add
      .image(1900, 5900, "wall", 2)
      .setDepth(Consts.Depth.UpperPlayer)
      .setAngle(-15);

    Here._.add
      .sprite(1900, 5800, "boss")
      .setDepth(Consts.Depth.UpperPlayer)
      .play("boss");
  }

  _addDungeonGarbage(x, y, toX, toY, garbageCount, spotCount) {
    const me = this;

    const rect = new Phaser.Geom.Rectangle(x, y, toX - x, toY - y);
    for (let i = 0; i < garbageCount; ++i) {
      const pos = Phaser.Geom.Rectangle.Random(rect);
      me._garbage.createGarbage(pos.x, pos.y);
    }

    for (let i = 0; i < spotCount; ++i) {
      const pos = Phaser.Geom.Rectangle.Random(rect);
      me._garbage.createSpot(pos.x, pos.y, true);
    }
  }

  _updateSoundVolume() {
    const me = this;

    const playerY = me._player.toGameObject().y;

    if (playerY < Config.Sound.StartHeight) {
      me._themeSound
        .setVolume(Config.Sound.MainMaxVolume)
        .setDetune(Config.Sound.MainMaxDetune);
      me._ambientSound.setVolume(Config.Sound.AmbientMinVolume);
      return;
    }

    if (playerY > Config.Sound.StopHeight) {
      me._themeSound
        .setVolume(Config.Sound.MainMinVolume)
        .setDetune(Config.Sound.MainMinDetune);
      me._ambientSound.setVolume(Config.Sound.AmbientMaxVolume);
      return;
    }

    const foo = playerY - Config.Sound.StartHeight;
    const maxFoo = Config.Sound.StopHeight - Config.Sound.StartHeight;
    const t = foo / maxFoo;

    me._themeSound
      .setVolume(
        Phaser.Math.Linear(
          Config.Sound.MainMaxVolume,
          Config.Sound.MainMinVolume,
          t
        )
      )
      .setDetune(
        Phaser.Math.Linear(
          Config.Sound.MainMaxDetune,
          Config.Sound.MainMinDetune,
          t
        )
      );

    me._ambientSound.setVolume(
      Phaser.Math.Linear(
        Config.Sound.AmbientMinVolume,
        Config.Sound.AmbientMaxVolume,
        t
      )
    );
  }

  gameOver() {
    const me = this;
    Utils.debugLog("game over");
    MyStaticTime.isGameOver = true;

    Here._.add
      .image(0, 0, "gameOver")
      .setOrigin(0, 0)
      .setDepth(Consts.Depth.UI + 1000)
      .setScrollFactor(0);

    me._themeSound
      .setVolume(Config.Sound.MainMaxVolume)
      .setDetune(Config.Sound.MainMaxDetune);
    me._ambientSound.stop();
  }
}
