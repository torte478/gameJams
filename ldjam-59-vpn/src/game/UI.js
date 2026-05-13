import Button from "../framework/Button.js";
import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Game from "./Game.js";
import Graph from "./Graph.js";

export default class UI {
  /** @type {Number} */
  _score = 0;

  /** @type {Phaser.GameObjects.Text} */
  _scoreText;

  /** @type {Phaser.Events.EventEmitter} */
  _events;

  /** @type {Graph} */
  _graph;

  /** @type {Button} */
  _newTowerButton;

  /** @type {Button} */
  _startFinalBossButton;

  /** @type {Phaser.Cameras.Scene2D.Camera} */
  _scoreCamera;

  /** @type {Button} */
  _vibeButton;

  constructor(events, graph) {
    const me = this;

    me._events = events;
    me._graph = graph;

    me._scoreCamera = Here._.cameras
      .add(425, 5, 150, 100)
      .setBackgroundColor(Config.Color.Dark)
      .setScroll(-1000, -1000);

    me._score = Utils.isDebug(Config.Debug.Global) ? Config.Start.Score : 0;

    me._scoreText = Here._.add
      .text(
        me._scoreCamera.scrollX + me._scoreCamera.width / 2,
        me._scoreCamera.scrollY + me._scoreCamera.height / 2,
        me._score,
        {
          fontFamily: Config.FontFamily,
          color: Utils.colorNumberToString(Config.Color.Light),
          fontSize: 48,
        },
      )
      .setOrigin(0.5, 0.5);

    me._newTowerButton = new Button({
      x: 100,
      y: 725,
      texture: "buttons",
      frameIdle: 0,
      frameSelected: 0,
      text: "10",
      callback: () => {
        me._newTowerButtonClick();
      },
      callbackScope: me,
    });
    me._newTowerButton.toGameObj().setVisible(false);

    me._startFinalBossButton = new Button({
      x: 900,
      y: 725,
      texture: "buttons",
      frameIdle: 2,
      frameSelected: 2,
      text: Config.BossCost + "",
      callback: () => {
        me._events.emit(Enums.Events.START_FINAL_BOSS_CLICK);
      },
      callbackScope: me,
    });

    me._vibeButton = new Button({
      x: 100,
      y: 625,
      texture: "buttons",
      frameIdle: 1,
      frameSelected: 1,
      text: Config.VibeCost + "",
      callback: () => {
        me._vibeButtonClick();
      },
      callbackScope: me,
    });

    me._scoreCamera.setVisible(false);
    me._vibeButton.toGameObj().setVisible(false);
    me._startFinalBossButton.toGameObj().setVisible(false);
  }

  /** @type {Phaser.GameObjects.PointLight[]} */
  _vibeLights = [];

  _vibeButtonClick() {
    const me = this;

    me._vibeButton.toGameObj().setVisible(false);
    Here.Audio.playVibe();

    // first

    const firstLight = Here._.add
      .pointlight(180, 220, 0xff0000, 200, 0.05)
      .setAlpha(0.5)
      .setDepth(Consts.Depth.Fade);

    const firstLightFollower = { t: 0, vec: new Phaser.Math.Vector2() };
    const firstLightPath = new Phaser.Curves.Path();
    firstLightPath.add(new Phaser.Curves.Ellipse(500, 400, 400));

    Here._.add.tween({
      targets: firstLightFollower,
      t: 1,
      ease: "Sine.easeInOut",
      duration: 14000,
      yoyo: true,
      repeat: -1,
    });

    firstLight.path = firstLightPath;
    firstLight.follower = firstLightFollower;

    me._vibeLights.push(firstLight);

    // second

    const secondLight = Here._.add
      .pointlight(180, 220, 0xf9f871, 400, 0.05)
      .setAlpha(0.5)
      .setDepth(Consts.Depth.Fade);

    const secondLightFollower = { t: 0, vec: new Phaser.Math.Vector2() };
    const secondLightPath = new Phaser.Curves.Path(100, 100);
    secondLightPath.lineTo(700, 300);
    secondLightPath.lineTo(100, 500);
    secondLightPath.lineTo(700, 700);

    Here._.add.tween({
      targets: secondLightFollower,
      t: 1,
      ease: "Sine.easeInOut",
      duration: 10000,
      yoyo: true,
      repeat: -1,
    });

    secondLight.path = secondLightPath;
    secondLight.follower = secondLightFollower;

    me._vibeLights.push(secondLight);

    // third

    const thirdLight = Here._.add
      .pointlight(180, 220, 0x00ff00, 350, 0.05)
      .setAlpha(0.5)
      .setDepth(Consts.Depth.Fade);

    const thirdLightFollower = { t: 0, vec: new Phaser.Math.Vector2() };
    const thirdLightPath = new Phaser.Curves.Path(50, 500);
    thirdLightPath.splineTo([164, 446, 274, 542, 412, 457, 522, 541, 664, 464]);
    thirdLightPath.lineTo(700, 300);
    thirdLightPath.lineTo(600, 350);
    thirdLightPath.ellipseTo(200, 100, 100, 250, false, 0);
    thirdLightPath.cubicBezierTo(222, 119, 308, 107, 208, 368);
    thirdLightPath.ellipseTo(60, 60, 0, 360, true);

    Here._.add.tween({
      targets: thirdLightFollower,
      t: 1,
      ease: "Sine.easeInOut",
      duration: 20000,
      yoyo: true,
      repeat: -1,
    });

    thirdLight.path = thirdLightPath;
    thirdLight.follower = thirdLightFollower;

    me._vibeLights.push(thirdLight);
  }

  update() {
    const me = this;

    for (const light of me._vibeLights) {
      /** @type {Phaser.Curves.Path} */
      const path = light.path;
      path.getPoint(light.follower.t, light.follower.vec);
      light.setPosition(light.follower.vec.x, light.follower.vec.y);
    }
  }

  showEndgameButtons() {
    const me = this;

    me._startFinalBossButton.toGameObj().setVisible(true);
    me._vibeButton.toGameObj().setVisible(true);

    me._runNewButtonParticles(me._startFinalBossButton);
    me._runNewButtonParticles(me._vibeButton);
  }

  onScoreIncrement() {
    const me = this;

    me._score += 1;
    me._invalidateUI();
  }

  decrementScore() {
    const me = this;

    me._score -= 1;
    me._invalidateUI();
  }

  startFinalBossSequence() {
    const me = this;

    me._startFinalBossButton.toGameObj().setVisible(false);
    me._newTowerButton.toGameObj().setVisible(false);
    me._vibeButton.toGameObj().setVisible(false);
    me._scoreCamera.setVisible(false);
  }

  reset() {
    const me = this;

    me._startFinalBossButton.toGameObj().setVisible(true);
  }

  showNewTowerButtonAndScore() {
    const me = this;

    me._newTowerButton.toGameObj().setVisible(true);
    me._scoreCamera.setVisible(true);
    me._newTowerButton._text.setText(Config.TowerInfo[2].cost);

    me._runNewButtonParticles(me._newTowerButton);
  }

  _runNewButtonParticles(button) {
    const me = this;

    const buttonPos = Utils.toPoint(button.toGameObj());
    Game.instance._vfx.newButtonParticles(buttonPos);
  }

  _invalidateUI() {
    const me = this;

    me._scoreText.setText(me._score);

    const towersCount = Game.instance._graph._towers.length;
    const isNewTowerButtonActive =
      towersCount < Config.TowerInfo.length &&
      me._score >= Config.TowerInfo[towersCount].cost;
    me._newTowerButton.setActive(isNewTowerButtonActive);

    me._startFinalBossButton.setActive(me._score >= Config.BossCost);
    me._vibeButton.setActive(me._score >= Config.VibeCost);
  }

  _newTowerButtonClick() {
    const me = this;

    let towersCount = Game.instance._graph._towers.length;
    me._score -= Config.TowerInfo[towersCount].cost;

    me._events.emit(Enums.Events.NEW_TOWER_BUTTON_CLICK);

    towersCount += 1;
    const hasFutureTowers = towersCount < Config.TowerInfo.length;
    me._newTowerButton._text.setText(
      hasFutureTowers ? Config.TowerInfo[towersCount].cost : "MAX",
    );

    me._invalidateUI();

    Here.Audio.play("pointerUp");
  }
}
