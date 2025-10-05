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

  /** @type {Phaser.GameObjects.Container} */
  _gobletContainer;

  /** @type {Phaser.GameObjects.Text} */
  _gobletText;

  /** @type {Phaser.Tweens.Tween} */
  _gobletTween;

  /** @type {Phaser.GameObjects.Text} */
  _mainText;

  /** @type {String} */
  _mainTextPattern = "of 8,031,810,176";

  /** @type {Number} */
  _completedOrderCount = 1; //8031810175;

  /** @type {Phaser.GameObjects.Image} */
  _speedometer;

  /** @type {Phaser.GameObjects.Text[]} */
  _speedometerText = [];

  /** @type {Phaser.GameObjects.Image} */
  _speedometerArrow;

  /** @type {Phaser.GameObjects.Image} */
  _panel;

  /** @type {Number} */
  _act;

  /** @type {Phaser.GameObjects.Image} */
  _table;

  /** @type {Phaser.GameObjects.Image} */
  _cover;

  // color red: #C61831

  constructor() {
    const me = this;

    me._camera = Here._.cameras.main;
    me._camera.setBounds(-1200, 0, 4000, 800).setBackgroundColor("#011427");

    Here._.add.image(-510, 300, "wall").setDepth(Consts.Depth.Wall);

    me._collection = new Collection();

    me._transports = Utils.buildArray(4, null);
    me._transports[Enums.Transport.Walk] = new Transport(2, 0.01, 0.01); // 1 ?
    me._transports[Enums.Transport.Skate] = new Transport(10, 1, 3);
    me._transports[Enums.Transport.Car] = new Transport(1000, 4, 5);
    me._transports[Enums.Transport.Rocket] = new Transport(1000, 4, 5);

    const background = Here._.add
      .image(0, 0, "background")
      .setOrigin(0, 0)
      .setPosition(-1200, 100)
      .setDepth(Consts.Depth.Background);

    me._table = Here._.add
      .image(-950, 400, "table")
      .setDepth(Consts.Depth.Table);

    me._isOnMarketZone = Config.Positions.Start < Config.Positions.Hole;
    me._gnome = Here._.add
      .sprite(Config.Positions.Start, 395, "gnome")
      .play("gnome_idle");
    me._scrollX = Config.Positions.Start - 500;

    me._camera.startFollow(me._gnome, true);

    me._initButtons();

    me._npc = Here._.add
      .image(Config.Positions.NpcSpawn, 360, "npc", 0)
      .setDepth(Consts.Depth.Table - 100);

    me._initGoblet();

    me._mainText = Here._.add
      .text(985, 50, "TEST", {
        fontSize: 56,
        color: "#344c72",
        fontFamily: "Archivo Black",
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(Consts.Depth.Button);
    me._updateMainText();

    me._speedometer = Here._.add
      .image(500, 650, "speedometer")
      .setScrollFactor(0)
      .setDepth(Consts.Depth.Panel + 10);

    for (let i = 0; i < 7; ++i) me._createSpeedometerText(345 + 52 * i);

    me._speedometerArrow = Here._.add
      .image(500, 600, "arrow")
      .setScrollFactor(0)
      .setDepth(Consts.Depth.Button);

    me._cover = Here._.add
      .image(-400, 300, "cover")
      .setDepth(Consts.Depth.Panel)
      .setVisible(false);

    // ACT INITITALIZE
    me._act = Utils.isDebug(Config.Debug.Global) ? Config.Debug.StartAct : 0;
    me._initAct();

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
      const currentShelf = ((me._scrollX + 100) / 200 + 2) | 0;
      const currentShelfStr = Utils.intToBase26(currentShelf);

      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `pos: ${currentShelfStr} || ${me._scrollX | 0} || \n` +
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
    me._updateSpeedometer();
    me._tryTakeOrder();
  }

  _updateMainText() {
    const me = this;

    me._mainText.setText(
      `${me._completedOrderCount.toLocaleString("en-US")} ${
        me._mainTextPattern
      }`
    );
  }

  _updateSpeedometer() {
    const me = this;

    const speedFactor =
      me._transports[me._currentTransportIndex]._accelerationProgress;
    const nextAngle =
      Consts.ArrowAngle.Min +
      speedFactor * (Consts.ArrowAngle.Max - Consts.ArrowAngle.Min);

    me._speedometerArrow.setAngle(nextAngle);

    const currentShelf = ((me._scrollX + 100) / 200 + 2) | 0;
    const currentShelfStr = Utils.intToBase26(currentShelf);
    for (let i = 0; i < currentShelfStr.length; ++i)
      me._speedometerText[i].setText(currentShelfStr[i]);
  }

  _createSpeedometerText(x) {
    const me = this;

    const text = Here._.add
      .text(x, 732, "D", {
        fontSize: 55,
        color: "#011121",
        fontFamily: "Pixelify Sans",
      })
      .setScrollFactor(0)
      .setOrigin(0.5, 0.5)
      .setDepth(Consts.Depth.Button);
    me._speedometerText.push(text);
  }

  _initGoblet() {
    const me = this;

    const gobletImage = Here._.add.image(0, 0, "goblet");
    me._gobletText = Here._.add
      .text(33, 78, "TEST", {
        fontSize: 26,
        color: "#000000",
        fontStyle: "bold",
        fontFamily: "Archivo Black",
      })
      .setOrigin(0.5, 0.5)
      .setAngle(8);

    me._gobletContainer = Here._.add
      .container(855, 645, [gobletImage, me._gobletText])
      .setDepth(Consts.Depth.Button)
      .setScrollFactor(0)
      .setSize(300, 300)
      .setInteractive();

    me._gobletContainer.on(
      "pointerover",
      (p) => {
        me._gobletContainer.setScale(1.1);
      },
      me
    );

    me._gobletContainer.on(
      "pointerout",
      (p) => {
        me._gobletContainer.setScale(1);
      },
      me
    );

    me._gobletContainer.on("pointerdown", (p) => me._tryCompleteOrder(), me);

    me._gobletContainer.setVisible(me._order !== null);
    if (Utils.isDebug(Config.Debug.Global)) {
      me._order = Config.Debug.Order;
      me._setOrderToGoblet();
    }

    me._gobletTween = Here._.tweens.add({
      targets: me._gobletContainer,
      angle: { from: -10, to: 10 },
      duration: 250,
      yoyo: true,
      repeat: -1,
    });
    me._pauseGobletTween();
  }

  _pauseGobletTween() {
    const me = this;

    me._gobletTween.pause();
    me._gobletContainer.setAngle(0);
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

    me._checkGobletAnimation();
  }

  _checkGobletAnimation() {
    const me = this;

    if (me._order === null) return;

    const isOrder = me._collection.isCurrentShelfCorrectForOrderIFE(
      me._scrollX,
      me._order
    );
    if (isOrder && me._gobletTween.paused) {
      me._gobletTween.play();
    } else if (!isOrder && !me._gobletTween.paused) {
      me._pauseGobletTween();
    }
  }

  _tryTakeOrder() {
    const me = this;
    if (me._act < 1) return;

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
            me._createNewRandomOrder();
          },
        });
      },
    });
  }

  _createNewRandomOrder() {
    const me = this;

    me._order = Utils.getRandom(0, 10);
    me._setOrderToGoblet();
  }

  _setOrderToGoblet() {
    const me = this;

    me._gobletText.setText(Utils.intToBase26(me._order));
    me._gobletContainer.setVisible(true);
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

    me._panel = Here._.add
      .image(500, 650, "panel")
      .setScrollFactor(0)
      .setDepth(Consts.Depth.Panel);

    me._buttons = Utils.buildArray(4, null); // TODO

    me._buttons[Enums.Transport.Walk] = new Button(
      90,
      580,
      0,
      () => me._trySelectTransport(Enums.Transport.Walk),
      me
    );

    me._buttons[Enums.Transport.Skate] = new Button(
      210,
      580,
      2,
      () => me._trySelectTransport(Enums.Transport.Skate),
      me
    );

    me._buttons[Enums.Transport.Car] = new Button(
      90,
      705,
      4,
      () => me._trySelectTransport(Enums.Transport.Car),
      me
    );

    me._buttons[Enums.Transport.Rocket] = new Button(
      210,
      705,
      6,
      () => me._trySelectTransport(Enums.Transport.Rocket),
      me
    );

    me._buttons[me._currentTransportIndex]._image.setFrame(
      me._currentTransportIndex * 2 + 1
    );
  }

  _tryCompleteOrder() {
    const me = this;

    const success = me._collection.tryCompleteOrder(me._scrollX, me._order);
    if (!success) return;

    me._order = null;
    me._gobletContainer.setVisible(false);
    me._pauseGobletTween();

    me._completedOrderCount += 1;
    me._updateMainText();
  }

  _trySelectTransport(trasnportIndex) {
    const me = this;
    if (me._currentTransportIndex === trasnportIndex) return;

    me._currentTransportIndex = trasnportIndex;
    for (let i = 0; i < me._buttons.length; ++i)
      me._buttons[i]._image.setFrame(i * 2);

    me._buttons[me._currentTransportIndex]._image.setFrame(
      me._currentTransportIndex * 2 + 1
    );
  }

  _setSpeedometerVisible(visible) {
    const me = this;

    me._speedometer.setVisible(visible);
    me._speedometerArrow.setVisible(visible);

    for (let i = 0; i < me._speedometerText.length; ++i)
      me._speedometerText[i].setVisible(false);
  }

  _initAct() {
    const me = this;

    me._isBusy = true;

    me._scrollX = -1450;
    me._gnome.setPosition(500 + me._scrollX, me._gnome.y);
    me._isOnMarketZone = true;

    // order
    me._order = null;
    me._gobletContainer.setVisible(false);
    me._pauseGobletTween();

    // ==== 0 =====
    if (me._act === 0) {
      for (let i = 0; i < me._buttons.length; ++i)
        me._buttons[i].setVisible(false).setEnable(false);

      me._setSpeedometerVisible(false);
      me._panel.setVisible(false);
      me._table.setVisible(false);

      me._mainText.setText("Click to start");
      me._cover.setVisible(true);

      me._gnome.play("gnome_sleep");

      Here._.input.on(
        "pointerdown",
        (p) => {
          if (me._act !== 0 || !me._cover.visible) return;

          me._cover.setVisible(false);
          me._isBusy = false;
          me._mainText.setText("Use A/D to move");
        },
        me
      );

      return;
    }

    throw `unexpected act ${me._act}`;
  }
}
