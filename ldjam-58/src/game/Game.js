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
  _completedOrderCount = 0; //8031810175;

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

  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _wallExplosionParticles;

  /** @type {Phaser.GameObjects.Image} */
  _collectable;

  /** @type {Phaser.GameObjects.Image} */
  _act1Title;

  /** @type {Phaser.GameObjects.Image} */
  _act2Title;

  /** @type {Phaser.GameObjects.Image} */
  _act3Title;

  /** @type {Phaser.GameObjects.Image} */
  _act4Title;

  /** @type {Number} */
  _orderIterator = 0;

  _lastOrderScroll = 0;

  /** @type {Phaser.GameObjects.Sprite} */
  _car;

  /** @type {Phaser.GameObjects.Image} */
  _rocket;

  // color red: #C61831

  constructor() {
    const me = this;

    me._car = Here._.add
      .sprite(0, 400, "car")
      .setVisible(false)
      .setDepth(Consts.Depth.Panel);

    me._rocket = Here._.add
      .image(0, 400, "rocket")
      .setVisible(false)
      .setDepth(Consts.Depth.Panel);

    me._wallExplosionParticles = Here._.add
      .particles(0, 0, "particles", {
        frame: [0, 1, 2, 3],
        speed: { min: 300, max: 500 },
        scale: { start: 0.8, end: 0 },
        gravityY: 300,
        //blendMode: "ADD",
        emitting: false,
      })
      .setDepth(Consts.Depth.Button);

    me._collectable = Here._.add
      .image(-1030, 345, "collectable")
      .setDepth(Consts.Depth.Button)
      .setVisible(false);

    me._act1Title = me._createActTitle("act1");
    me._act2Title = me._createActTitle("act2");
    me._act3Title = me._createActTitle("act3");
    me._act4Title = me._createActTitle("act4");

    me._camera = Here._.cameras.main;
    me._camera.setBounds(-1200, 0, 4000, 800).setBackgroundColor("#011427");

    Here._.add.image(-510, 300, "wall").setDepth(Consts.Depth.Wall);

    me._collection = new Collection();

    const walkSpeed = Utils.isDebug(Config.Debug.Global)
      ? Config.Debug.WalkSpeed
      : 1.5;
    me._transports = Utils.buildArray(4, null);
    me._transports[Enums.Transport.Walk] = new Transport(walkSpeed, 0.01, 0.01); // 1 ?
    me._transports[Enums.Transport.Skate] = new Transport(10, 1, 3);
    me._transports[Enums.Transport.Car] = new Transport(1000, 4, 5);
    me._transports[Enums.Transport.Rocket] = new Transport(2000, 0.5, 60);

    const background = Here._.add
      .image(0, 0, "background")
      .setOrigin(0, 0)
      .setPosition(-1200, 100)
      .setDepth(Consts.Depth.Background);

    me._table = Here._.add
      .image(-950, 400, "table")
      .setDepth(Consts.Depth.Table);

    me._isOnMarketZone = Config.Positions.Start < Config.Positions.Hole;
    me._gnome = Here._.add.sprite(Config.Positions.Start, 395, "gnome");
    me._playIdleAnimation();
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
    ) {
      Here._.sound.stopAll();
      Here._.scene.restart({ isRestart: true });
    }

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
    me._updateActThings();
  }

  _createActTitle(texture) {
    const me = this;

    return Here._.add
      .image(500, 400, texture)
      .setScrollFactor(0)
      .setDepth(Consts.Depth.Max)
      .setVisible(false);
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

    if (me._currentTransportIndex != Enums.Transport.Walk) {
      const speedFactor =
        me._transports[me._currentTransportIndex]._accelerationProgress;
      const nextAngle =
        Consts.ArrowAngle.Min +
        speedFactor * (Consts.ArrowAngle.Max - Consts.ArrowAngle.Min);

      me._speedometerArrow.setAngle(nextAngle);
    } else {
      me._speedometerArrow.setAngle(Consts.ArrowAngle.Min);
    }

    const currentShelf = ((me._scrollX + 100) / 200 + 2) | 0;
    const currentShelfStr =
      currentShelf >= 0 ? Utils.intToBase26(currentShelf) : "";

    for (let i = 0; i < currentShelfStr.length; ++i)
      me._speedometerText[i].setText(currentShelfStr[i]);
  }

  _createSpeedometerText(x) {
    const me = this;

    const text = Here._.add
      .text(x, 732, "A", {
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
    let velocityX = transport.getVelocity(deltaTime, me._currentTransportIndex);

    if (velocityX !== 0) {
      me._playMoveSound();
      me._scrollX = Math.max(me._scrollX + velocityX, Config.TakeOrderPosition);

      me._gnome.setFlipX(velocityX < 0);
      me._playMoveAnimation();

      for (let i = 0; i < me._buttons.length; ++i)
        me._buttons[i].setEnable(false);

      if (me._scrollX >= 0) {
        me._gnome.setPosition(500, me._gnome.y);
        me._collection.updatePos(me._scrollX, me._act);
      } else {
        me._gnome.setPosition(500 + me._scrollX, me._gnome.y);
        me._checkHole(velocityX);
      }

      me._car
        .setPosition(me._gnome.x, me._car.y)
        .setFlipX(me._gnome.flipX)
        .play("car_ride", true);
      me._rocket.setPosition(me._gnome.x, me._gnome.y);
    } else {
      me._playIdleAnimation();
      me._stopMoveSound();

      me._invalidateButtonEnable();
      me._car.stop();
    }

    me._checkGobletAnimation();
  }

  _invalidateButtonEnable() {
    const me = this;

    me._buttons[Enums.Transport.Walk].setEnable(true);
    me._buttons[Enums.Transport.Skate].setEnable(
      !me._isOnMarketZone && me._act >= 2
    );
    me._buttons[Enums.Transport.Car].setEnable(
      !me._isOnMarketZone && me._act >= 3
    );
    me._buttons[Enums.Transport.Rocket].setEnable(
      !me._isOnMarketZone && me._act >= 4
    );
  }

  _playIdleAnimation() {
    const me = this;

    const key =
      me._currentTransportIndex === Enums.Transport.Walk
        ? "gnome_idle"
        : me._currentTransportIndex === Enums.Transport.Skate
        ? "gnome_skate_idle"
        : me._currentTransportIndex === Enums.Transport.Car
        ? "gnome_nothing"
        : me._currentTransportIndex === Enums.Transport.Rocket
        ? "gnome_nothing"
        : null;

    if (key === null) throw "null animation";

    me._gnome.play(key, true);
  }

  _playMoveAnimation() {
    const me = this;

    const key =
      me._currentTransportIndex === Enums.Transport.Walk
        ? "gnome_walk"
        : me._currentTransportIndex === Enums.Transport.Skate
        ? "gnome_skate_walk"
        : me._currentTransportIndex === Enums.Transport.Car
        ? "gnome_nothing"
        : me._currentTransportIndex === Enums.Transport.Rocket
        ? "gnome_nothing"
        : null;

    if (key === null) throw "null animation";

    me._gnome.play(key, true);
  }

  _playMoveSound() {
    const me = this;

    const key =
      me._currentTransportIndex === Enums.Transport.Walk
        ? "walk"
        : me._currentTransportIndex === Enums.Transport.Skate
        ? "skate"
        : me._currentTransportIndex === Enums.Transport.Car
        ? "car"
        : me._currentTransportIndex === Enums.Transport.Rocket
        ? "rocket"
        : null;

    if (key === null) throw "null sound";

    Here.Audio.playIfNotPlaying(key, { loop: true });
  }

  _stopMoveSound() {
    const me = this;

    Here.Audio.stop("walk");
    Here.Audio.stop("skate");
    Here.Audio.stop("car");
    Here.Audio.stop("rocket");
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

  _spawnNpc() {
    const me = this;

    me._npc.setFlipX(false);
    Here._.tweens.add({
      targets: me._npc,
      x: -1120,
      ease: "sine.out",
      duration: 1000,
      onComplete: () => {
        me._collectable.setVisible(true);
      },
    });
  }

  _tryTakeOrder() {
    const me = this;
    if (me._act < 1) return;

    if (me._order !== null || me._scrollX > Config.TakeOrderPosition + 10)
      return;

    me._collectable.setVisible(false);
    me._createNextOrder();
    me._npc.setFlipX(true);

    Here._.tweens.add({
      targets: me._npc,
      x: Config.Positions.NpcSpawn,
      ease: "sine.in",
      duration: 1000,
    });
  }

  _createNextOrder() {
    const me = this;

    me._order = Config.Orders[me._act][me._orderIterator];
    me._orderIterator += 1;
    me._setOrderToGoblet();
  }

  _setOrderToGoblet() {
    const me = this;

    me._gobletText.setText(Utils.intToBase26(me._order));
    me._gobletContainer.setVisible(true);

    Here.Audio.play("coin", { volume: 0.7 });
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
      me._stopMoveSound();

      const originX = me._gnome.x;
      me._gnome
        .setPosition(Config.Positions.Hole - 25, me._gnome.y - 50)
        .setFlipX(false)
        .setAngle(90);

      me._playMoveAnimation();

      Here._.time.delayedCall(
        Utils.isDebug(Config.Debug.Delays) ? 10 : 1000,
        () => {
          me._gnome
            .setPosition(Config.Positions.Hole + 200, me._gnome.y + 50)
            .setAngle(0);
          me._playIdleAnimation();
          me._scrollX += me._gnome.x - originX;
          me._isBusy = false;
          me._isOnMarketZone = false;

          me._invalidateButtonEnable();

          if (me._act > 0)
            Here.Audio.playIfNotPlaying("main", { volume: 0.25, loop: true });
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
      me._stopMoveSound();
      const originX = me._gnome.x;

      me._trySelectTransport(Enums.Transport.Walk);

      if (velocityX < -10) {
        me._crushToWall();
        return;
      }

      me._buttons[Enums.Transport.Skate].setEnable(false);
      me._buttons[Enums.Transport.Car].setEnable(false);
      me._buttons[Enums.Transport.Rocket].setEnable(false);

      me._gnome
        .setPosition(Config.Positions.Hole + 50, me._gnome.y - 50)
        .setFlipX(true)
        .setAngle(-90);

      me._playMoveAnimation();

      Here._.time.delayedCall(
        Utils.isDebug(Config.Debug.Delays) ? 10 : 1000,
        () => {
          me._gnome
            .setPosition(Config.Positions.Hole - 200, me._gnome.y + 50)
            .setAngle(0);
          me._playIdleAnimation();
          me._scrollX += me._gnome.x - originX;
          me._isBusy = false;
          me._isOnMarketZone = true;
        },
        me
      );
    }
  }

  _crushToWall() {
    const me = this;

    me._isBusy = true;
    me._runWallExplode();

    me._stopMoveSound();

    const originalPos = Utils.toPoint(me._gnome);
    me._gnome.setFlipX(false).setPosition(-350, 300).play("gnome_death_wall");

    const delay = 1000; //me._getDelay(1000);
    Here._.time.delayedCall(
      delay,
      () => {
        me._scrollX = me._lastOrderScroll;
        me._playIdleAnimation();
        me._gnome.setPosition(500, originalPos.y);
        me._collection.updatePos(me._scrollX, me._act);
        me._car
          .setPosition(me._gnome.x, me._car.y)
          .setFlipX(me._gnome.flipX)
          .stop();

        me._isBusy = false;
      },
      me
    );
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
    ).setEnable(true);

    me._buttons[Enums.Transport.Skate] = new Button(
      210,
      580,
      2,
      () => me._trySelectTransport(Enums.Transport.Skate),
      me
    ).setEnable(false);

    me._buttons[Enums.Transport.Car] = new Button(
      90,
      705,
      4,
      () => me._trySelectTransport(Enums.Transport.Car),
      me
    ).setEnable(false);

    me._buttons[Enums.Transport.Rocket] = new Button(
      210,
      705,
      6,
      () => me._trySelectTransport(Enums.Transport.Rocket),
      me
    ).setEnable(false);

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

    me._lastOrderScroll = Math.max(0, me._scrollX);

    if (me._act > 0) me._spawnNpc();

    me._checkActActionOnCompleteOrder();
  }

  _trySelectTransport(trasnportIndex) {
    const me = this;
    if (me._currentTransportIndex === trasnportIndex) return;
    const currentTransport = me._transports[me._currentTransportIndex];
    currentTransport._accelerationProgress = 0;

    me._currentTransportIndex = trasnportIndex;
    for (let i = 0; i < me._buttons.length; ++i)
      me._buttons[i]._image.setFrame(i * 2);

    me._buttons[me._currentTransportIndex]._image.setFrame(
      me._currentTransportIndex * 2 + 1
    );

    me._car.setVisible(trasnportIndex === Enums.Transport.Car);
    me._rocket.setVisible(trasnportIndex === Enums.Transport.Rocket);
  }

  _setSpeedometerVisible(visible) {
    const me = this;

    me._speedometer.setVisible(visible);
    me._speedometerArrow.setVisible(visible);

    for (let i = 0; i < me._speedometerText.length; ++i)
      me._speedometerText[i].setVisible(visible);
  }

  _runWallExplode() {
    const me = this;

    me._wallExplosionParticles.explode(200, -510, 300);
    Here._.cameras.main.shake(200);
    Here.Audio.play("explosion");
  }

  _updateActThings() {
    const me = this;

    if (me._act === 0) {
      if (me._collectable.visible && me._gnome.x >= me._collectable.x - 40) {
        me._collectable.setVisible(false).setAngle(0).setPosition(-1030, 345);

        me._order = Config.Orders[0][0];
        me._setOrderToGoblet();
        me._mainText.setText("Find the right place");
      }
    }
  }

  _getDelay(value) {
    const me = this;

    return Utils.isDebug(Config.Debug.Delays) ? 10 : value;
  }

  _checkActActionOnCompleteOrder() {
    const me = this;

    if (me._isBusy) return;

    if (me._act === 0) {
      me._isBusy = true;

      Here.Audio.stopAll();
      Here.Audio.play("epic", { volume: 0.7 });
      me._gnome.play("gnome_wonder");

      Here._.time.delayedCall(
        me._getDelay(5000),
        () => {
          me._act = 1;
          me._initAct();
        },
        me
      );
      return;
    }

    if (me._act === 1 || me._act === 2 || me._act === 3) {
      if (me._orderIterator < Config.Orders[me._act].length) return;

      me._isBusy = true;
      me._act += 1;

      me._isBusy = true;
      Here._.time.delayedCall(500, () => me._initAct(), me);

      return;
    }
  }

  _initAct() {
    const me = this;

    me._isBusy = true;

    me._scrollX = -1300;
    me._gnome.setPosition(500 + me._scrollX, me._gnome.y);
    me._isOnMarketZone = true;

    me._collection.updatePos(0, me._act);
    me._trySelectTransport(Enums.Transport.Walk);

    // order
    me._order = null;
    me._orderIterator = 0;
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
      me._collectable.setVisible(true).setPosition(300, 480).setAngle(90);

      Here._.input.on(
        "pointerdown",
        (p) => {
          if (me._act !== 0 || !me._cover.visible) return;

          me._cover.setVisible(false);
          me._isBusy = false;
          me._mainText.setText("Use A/D to move");

          me._runWallExplode();
        },
        me
      );

      return; // ==== 0 =====
    }

    // ==== 1 =====
    if (me._act === 1) {
      me._setSpeedometerVisible(false);
      me._panel.setVisible(true);
      me._table.setVisible(true);

      me._buttons[0].setVisible(true).setEnable(true);
      for (let i = 1; i < me._buttons.length; ++i)
        me._buttons[i].setVisible(true).setEnable(false);

      // show title screen
      me._act1Title.setVisible(true);
      const duration = Utils.isDebug(Config.Debug.Delays) ? 10 : 3000;
      Here._.time.delayedCall(
        duration,
        () => {
          // end title
          Here.Audio.stopAll();
          me._act1Title.setVisible(false);
          me._isBusy = false;
          Here._.time.delayedCall(1000, () => me._spawnNpc(), me);
        },
        me
      );

      return; // ==== 1 =====
    }

    // ==== 2 =====
    if (me._act === 2) {
      me._setSpeedometerVisible(false);
      me._completedOrderCount += 22;
      me._updateMainText();

      // show title screen
      me._act2Title.setVisible(true);
      const duration = Utils.isDebug(Config.Debug.Delays) ? 10 : 1000;
      Here._.time.delayedCall(
        duration,
        () => {
          // end title
          me._act2Title.setVisible(false);
          me._isBusy = false;
        },
        me
      );

      return; // ==== 2 =====
    }

    // ==== 3 =====
    if (me._act === 3) {
      me._completedOrderCount += 10758;
      me._updateMainText();
      me._setSpeedometerVisible(true);

      // show title screen
      me._act3Title.setVisible(true);
      const duration = Utils.isDebug(Config.Debug.Delays) ? 10 : 1000;
      Here._.time.delayedCall(
        duration,
        () => {
          // end title
          me._act3Title.setVisible(false);
          me._isBusy = false;
        },
        me
      );

      return; // ==== 3 =====
    }

    // ==== 4 =====
    if (me._act === 4) {
      me._completedOrderCount = 8031810176 - 1;
      me._updateMainText();

      // show title screen
      me._act4Title.setVisible(true);
      const duration = Utils.isDebug(Config.Debug.Delays) ? 10 : 1000;
      Here._.time.delayedCall(
        duration,
        () => {
          // end title
          me._act4Title.setVisible(false);
          me._isBusy = false;
        },
        me
      );

      return; // ==== 4 =====
    }

    throw `unexpected act ${me._act}`;
  }
}
