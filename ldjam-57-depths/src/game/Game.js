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

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Player} */
  _player;

  /** @type {Garbage} */
  _garbage;

  /** @type {Tools} */
  _tools;

  constructor() {
    const me = this;

    me._player = new Player();
    me._garbage = new Garbage(me._player.toGameObject());

    me._tools = new Tools(me._garbage);

    // me._dumpster = new Dumpster(me._garbage, me._tools);

    me._initMap();

    const camera = Here._.cameras.main;
    camera
      .setBackgroundColor(0xe2f0f7)
      // .setBackgroundColor(0x1d083c) // main color
      .startFollow(me._player.toGameObject())
      .setBounds(0, 0, 2000, 2000)
      .setRoundPixels(true);

    // new Trigger(
    //   me._player,
    //   600,
    //   600,
    //   200,
    //   100,
    //   () => {
    //     console.log("trigger");
    //   },
    //   me
    // );

    // ----

    Here._.input.on("pointerdown", me._onPointerDown, me);

    // ----

    // const rect = new Phaser.Geom.Rectangle(100, 100, 600, 600);
    // for (let i = 0; i < 5; ++i) {
    //   const pos = Phaser.Geom.Rectangle.Random(rect);
    //   me._garbage.createGarbage(pos.x, pos.y);
    // }

    // for (let i = 0; i < 5; ++i) {
    //   const pos = Phaser.Geom.Rectangle.Random(rect);
    //   me._garbage.createSpot(pos.x, pos.y);
    // }

    // me._garbage.createBucket(300, 200);
    // me._garbage.createBag(300, 250);

    // me._garbage.createGarbageWall(500, 500);

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 10, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);
    });
  }

  update(deltaSec) {
    const me = this;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    ) {
      Here._.scene.restart({ isRestart: true });
    }

    me._player.update(deltaSec);
    me._tools.update();

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;
      const playerHand = me._player.toMousePos();
      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `crs: ${playerHand.x | 0} ${playerHand.y | 0}\n` +
        `tol: ${me._tools.currentTool}\n` +
        `mop: ${me._tools._mopDirt}\n` +
        `hand: ${me._tools._handContentType}\n` +
        `mana: ${me._tools._mana}`;

      me._log.setText(text);
    });
  }

  _onPointerDown() {
    const me = this;

    Here._.input.mouse.requestPointerLock();

    me._tools.onPointerDown(me._player.toMousePos(), me._player.toGameObject());
  }

  _initMap() {
    const me = this;

    const tilemap = Here._.make.tilemap({
      key: "map",
      tileWidth: Consts.Unit.Big,
      tileHeight: Consts.Unit.Big,
    });
    const tileset = tilemap.addTilesetImage("wall");
    const layer = tilemap.createLayer(0, tileset, 0, 0);

    tilemap.setCollision(1);
    Here._.physics.add.collider(me._player.toGameObject(), layer);
  }
}
