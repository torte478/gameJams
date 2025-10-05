import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Button from "./Button.js";
import Collection from "./Collection.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Transport from "./Transport.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Collection} */
  _collection;

  /** @type {Phaser.GameObjects.Sprite} */
  _gnome;

  /** @type {Phaser.Cameras.Scene2D.Camera} */
  _camera;

  /** @type {Number} */
  _scrollX = 0;

  /** @type {Number | Null} */
  _order = null;

  /** @type {Button[]} */
  _buttons = [];

  /** @type {Transport[]} */
  _transports = [];

  /** @type {Number} */
  _currentTransportIndex = Enums.Transport.Walk;

  /** @type {Boolean} */
  _isOnMarketZone;

  /** @type {Boolean} */
  _isBusy = false;

  /** @type {Phaser.GameObjects.Image} */
  _npc;

  // color red: #C61831

  constructor() {
    const me = this;

    me._camera = Here._.cameras.main;
    me._camera.setBounds(-1200, 0, 4000, 800).setBackgroundColor("#011427");

    Here._.add.image(-510, 300, "wall").setDepth(Consts.Depth.Wall);

    me._collection = new Collection();

    me._transports = Utils.buildArray(4, null);
    me._transports[Enums.Transport.Walk] = new Transport(1, 0.01, 0.01);
    me._transports[Enums.Transport.Scooter] = new Transport(10, 1, 3);
    me._transports[Enums.Transport.Car] = new Transport(1000, 4, 5);

    const background = Here._.add
      .image(0, 0, "background")
      .setOrigin(0, 0)
      .setPosition(-1200, 100)
      .setDepth(Consts.Depth.Background);

    Here._.add.image(-950, 400, "table").setDepth(Consts.Depth.Table);

    me._isOnMarketZone = Config.Positions.Start < Config.Positions.Hole;
    me._gnome = Here._.add
      .sprite(Config.Positions.Start, 400, "gnome")
      .play("gnome_idle");
    me._scrollX = Config.Positions.Start - 500;

    me._camera.startFollow(me._gnome, true);

    me._initButtons();

    me._npc = Here._.add
      .image(Config.Positions.NpcSpawn, 360, "npc", 0)
      .setDepth(Consts.Depth.Table - 100);

    //Here._.add.image(850, 600, "order");

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 10, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);
    });
  }

  update(time, deltaTime) {
    const me = this;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    )
      Here._.scene.restart({ isRestart: true });

    me._gameLoop(deltaTime);

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;

      const todoCurrentIndex = ((me._scrollX + 100) / 200 + 2) | 0;
      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `pos: ${Utils.intToBase26(todoCurrentIndex)} || ${
          me._scrollX | 0
        } || \n` +
        `acc: ${
          (me._transports[me._currentTransportIndex]._accelerationProgress *
            100) |
          0
        }\n` +
        `ord: ${me._order} || ${Utils.intToBase26(me._order)}\n` +
        `trn: ${me._currentTransportIndex}`;

      me._log.setText(text);
    });
  }

  _gameLoop(deltaTime) {
    const me = this;

    if (me._isBusy) return;

    me._updateMovement(deltaTime);
    me._tryTakeOrder();
  }

  _updateMovement(deltaTime) {
    const me = this;

    const transport = me._transports[me._currentTransportIndex];
    let velocityX = transport.getVelocity(deltaTime);

    if (velocityX !== 0) {
      me._scrollX = Math.max(me._scrollX + velocityX, Config.TakeOrderPosition);

      me._gnome.setFlipX(velocityX < 0);
      me._gnome.play("gnome_walk", true);

      if (me._scrollX >= 0) {
        me._gnome.setPosition(500, me._gnome.y);
        me._collection.updatePos(me._scrollX);
      } else {
        me._gnome.setPosition(500 + me._scrollX, me._gnome.y);
        me._checkHole(velocityX);
      }
    } else {
      me._gnome.play("gnome_idle", true);
    }
  }

  _tryTakeOrder() {
    const me = this;
    if (me._order !== null || me._scrollX > Config.TakeOrderPosition + 10)
      return;

    me._isBusy = true;
    me._gnome.setFlipX(true).play("gnome_idle");
    me._npc.setFlipX(false);

    Here._.tweens.add({
      targets: me._npc,
      x: -1120,
      ease: "sine.out",
      duration: 1000,
      onComplete: () => {
        Here._.tweens.add({
          targets: me._npc,
          x: Config.Positions.NpcSpawn,
          ease: "sine.in",
          duration: 1000,
          delay: 500,
          onStart: () => {
            me._npc.setFlipX(true);

            me._isBusy = false;
            me._createNewOrder();
          },
        });
      },
    });
  }

  _createNewOrder() {
    const me = this;

    me._order = Utils.getRandom(0, 10);
  }

  _checkHole(velocityX) {
    const me = this;

    // move right

    if (
      velocityX > 0 &&
      me._gnome.x >= Config.Positions.Hole - 150 &&
      me._isOnMarketZone
    ) {
      me._isBusy = true;
      const originX = me._gnome.x;
      me._gnome
        .setPosition(Config.Positions.Hole - 25, me._gnome.y - 50)
        .setFlipX(false)
        .setAngle(90)
        .play("gnome_walk");

      Here._.time.delayedCall(
        1000,
        () => {
          me._gnome
            .setPosition(Config.Positions.Hole + 200, me._gnome.y + 50)
            .setAngle(0)
            .play("gnome_idle");
          me._scrollX += me._gnome.x - originX;
          me._isBusy = false;
          me._isOnMarketZone = false;
        },
        me
      );
    }

    // move left

    if (
      velocityX < 0 &&
      me._gnome.x <= Config.Positions.Hole + 150 &&
      !me._isOnMarketZone
    ) {
      me._isBusy = true;
      const originX = me._gnome.x;
      me._gnome
        .setPosition(Config.Positions.Hole + 50, me._gnome.y - 50)
        .setFlipX(true)
        .setAngle(-90)
        .play("gnome_walk");

      Here._.time.delayedCall(
        1000,
        () => {
          me._gnome
            .setPosition(Config.Positions.Hole - 200, me._gnome.y + 50)
            .setAngle(0)
            .play("gnome_idle");
          me._scrollX += me._gnome.x - originX;
          me._isBusy = false;
          me._isOnMarketZone = true;
        },
        me
      );
    }
  }

  _initButtons() {
    const me = this;

    Here._.add
      .image(500, 650, "panel")
      .setScrollFactor(0)
      .setDepth(Consts.Depth.Panel);

    me._buttons = Utils.buildArray(4, null); // TODO

    // me._buttons[Enums.Button.CompleteOrder] = new Button(
    //   700,
    //   600,
    //   2,
    //   () => me._tryCompleteOrder(),
    //   null,
    //   null,
    //   me
    // );

    me._buttons[Enums.Button.SelectTransportWalk] = new Button(
      150,
      550,
      0,
      () => me._trySelectTransport(Enums.Transport.Walk),
      null,
      null,
      me
    );

    me._buttons[Enums.Button.SelectTransportScooter] = new Button(
      150,
      650,
      1,
      () => me._trySelectTransport(Enums.Transport.Scooter),
      null,
      null,
      me
    );

    me._buttons[Enums.Button.SelectTransportScooter] = new Button(
      150,
      750,
      2,
      () => me._trySelectTransport(Enums.Transport.Car),
      null,
      null,
      me
    );
  }

  _tryCompleteOrder() {
    const me = this;

    const success = me._collection.tryCompleteOrder(me._scrollX, me._order);
    if (success) {
      me._order = null;
    }
  }

  _trySelectTransport(trasnportIndex) {
    const me = this;
    me._currentTransportIndex = trasnportIndex;
  }
}
