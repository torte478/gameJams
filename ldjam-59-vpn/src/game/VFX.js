import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Game from "./Game.js";
import UI from "./UI.js";

export default class VFX {
  /** @type {Phaser.Math.Vector2[]} */
  _towerPositions;

  /** @type {Number} */
  _index = 0;

  /** @type {UI} */
  _ui;

  /** @type {Boolean} */
  _isSpawing = false;

  /** @type  {Phaser.GameObjects.Image} */
  _title;

  /** @type {Phaser.GameObjects.Image} */
  _hintConnectTowers;

  /** @type {Phaser.GameObjects.Image} */
  _hintDeleteChannel;

  /** @type {Phaser.GameObjects.Image} */
  _hintLast;

  /** @type {Phaser.GameObjects.Image[]} */
  _tapes = [];

  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _plusOneEmmiter;

  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _minuxOneEmmiter;

  /** @type {Phaser.GameObjects.Image} */
  _tentacle;

  constructor(ui) {
    const me = this;

    me._ui = ui;

    me._emitter = Here._.add.particles(0, 0, "bullet", {
      lifespan: 2000,
      speed: 400, //{ min: 400, max: 400 },
      emitting: false,
    });

    me._tentacle = Here._.add
      .image(400, 400, "tentacle")
      .setDepth(Consts.Depth.Fade)
      .setVisible(false);

    me._plusOneEmmiter = Here._.add
      .particles(0, 0, "digits", {
        lifespan: 1000,
        speed: 100, //{ min: 400, max: 400 },
        frame: 0,
        alpha: { from: 1, to: 0 },
        scale: 0.5,
        emitting: false,
      })
      .setDepth(Consts.Depth.TowerEffects);

    me._minusOneEmmiter = Here._.add
      .particles(0, 0, "digits", {
        lifespan: 1000,
        speed: 100, //{ min: 400, max: 400 },
        frame: 1,
        alpha: { from: 1, to: 0 },
        scale: 0.5,
        emitting: false,
      })
      .setDepth(Consts.Depth.TowerEffects);

    if (Game.phaseId < Enums.Phase.TODO) {
      me._title = Here._.add.image(500, 100, "title"); //1
      me._hintConnectTowers = Here._.add
        .image(720, 710, "hintConnectTowers")
        .setAngle(-15);

      me._hintLast = Here._.add.image(720, 900, "hintLast").setAngle(5); //700

      me._hintDeleteChannel = Here._.add
        .image(-150, 220, "hintDeleteChannel") // required 150
        .setAngle(10);
    }

    if (Game.phaseId === Enums.Phase.P0_START) {
      me._tapes.push(
        Here._.add.image(520, 800, "tape", 0).setAngle(-15).setFlipY(true),
      );
      me._tapes.push(Here._.add.image(500, 300, "tape", 0).setAngle(15));
      me._tapes.push(
        Here._.add
          .image(480, 500, "tape", 0)
          .setAngle(-12)
          .setScale(1.2)
          .setFlipX(true),
      );
      me._tapes.push(
        Here._.add.image(400, 400, "tape", 0).setAngle(-80).setScale(0.8),
      );
      me._tapes.push(
        Here._.add.image(400, 320, "tape", 0).setAngle(-45).setScale(1.5, 1),
      );

      for (let i = 0; i < me._tapes.length; ++i) {
        me._tapes[i].setDepth(Consts.Depth.Fade + i);
      }
    }
  }

  tryShotBoss() {
    const me = this;

    if (!me._isSpawing || me._ui._score <= 0) return 0;

    const pos = me._towerPositions[me._index];
    me._index = (me._index + 1) % me._towerPositions.length;

    me._emitter.emitParticleAt(pos.x, pos.y, 1);

    me._ui.decrementScore();

    return 1;
  }

  plusOneParticles(pos) {
    const me = this;

    me._plusOneEmmiter.emitParticleAt(pos.x, pos.y, 1);
  }

  minusOneParticles(pos) {
    const me = this;

    me._minusOneEmmiter.emitParticleAt(pos.x, pos.y, 1);
  }

  startSpawn(towerPositions, bulletCount) {
    const me = this;

    me._towerPositions = towerPositions;
    me._index = 0;
    me._isSpawing = true;
  }

  processPhase0Click() {
    const me = this;

    const tape = me._tapes[me._tapes.length - 1];
    tape.setFrame(1);
    Here.Audio.play("damage");

    const targetPos = Utils.buildPoint(tape.x, 1800);
    Here._.add.tween({
      targets: tape,
      y: targetPos.y,
      duration: Utils.getTweenDuration(
        Utils.toPoint(tape),
        targetPos,
        Config.Speed.TapeFall,
      ),
      ease: "sine.in",
      onComplete: () => {
        tape.destroy(true);
      },
    });

    me._tapes.splice(me._tapes.length - 1, 1);

    return me._tapes.length === 0;
  }

  tenctacleVpnTitle(doQuickly) {
    const me = this;

    const fromPos = Utils.buildPoint(500, -200);
    const toPos = Utils.buildPoint(500, 100);

    me._tentacleAction(fromPos, toPos, 90, me._title, doQuickly, () =>
      me._ui.showNewTowerButtonAndScore(),
    );
  }

  tenctacleRightClickHint(doQuickly) {
    const me = this;

    const fromPos = Utils.buildPoint(-250, 200);
    const toPos = Utils.buildPoint(150, 200);

    me._tentacleAction(
      fromPos,
      toPos,
      0,
      me._hintDeleteChannel,
      doQuickly,
      () => {},
    );
  }

  tenctacleConnectHint(doQuickly) {
    const me = this;

    me._tentacleAction(
      Utils.buildPoint(800, 1000),
      Utils.buildPoint(800, 750),
      -90,
      me._hintConnectTowers,
      doQuickly,
      () => {
        if (!doQuickly) me._showRightClickHint();
      },
    );
  }

  _showRightClickHint() {
    const me = this;

    const speed = Utils.getDurationMaybeQuick(Config.Speed.Tentacle);

    const fromPos = Utils.toPoint(me._hintDeleteChannel);
    const toPos = Utils.buildPoint(150, fromPos.y);

    Here._.add.tween({
      targets: me._hintDeleteChannel,
      x: toPos.x,
      y: toPos.y,
      ease: "sine.out",
      duration: Utils.getTweenDuration(fromPos, toPos, speed),
    });
  }

  showLastHint() {
    const me = this;

    const speed = Utils.getDurationMaybeQuick(Config.Speed.Tentacle);

    const fromPos = Utils.toPoint(me._hintLast);
    const toPos = Utils.buildPoint(720, 700);

    Here._.add.tween({
      targets: me._hintLast,
      x: toPos.x,
      y: toPos.y,
      ease: "sine.out",
      duration: Utils.getTweenDuration(fromPos, toPos, speed),
      onComplete: () => {
        Here._.time.delayedCall(
          5000,
          () => {
            me._tentacleAction(
              Utils.buildPoint(800, 1000),
              Utils.buildPoint(800, 750),
              -90,
              me._hintLast,
              false,
              () => {},
            );
          },
          me,
        );
      },
    });
  }

  /**
   *
   * @param {Phaser.Math.Vector2} fromPos
   * @param {Phaser.Math.Vector2} toPos
   * @param {Number} angle
   * @param {Phaser.GameObjects.GameObject} other
   * @param {Boolean | null} doQuickly
   * @param {Function} handler
   */
  _tentacleAction(fromPos, toPos, angle, other, doQuickly, handler) {
    const me = this;

    me._tentacle
      .setPosition(fromPos.x, fromPos.y)
      .setVisible(true)
      .setAngle(angle);

    let tentacleSpeed = Utils.getSpeedMaybeQuick(Config.Speed.Tentacle);
    if (!!doQuickly) tentacleSpeed *= 10;

    Here._.tweens.add({
      targets: me._tentacle,
      x: toPos.x,
      y: toPos.y,
      duration: Utils.getTweenDuration(fromPos, toPos, tentacleSpeed),
      ease: "sine.out",
      onComplete: () => {
        Here._.tweens.add({
          targets: [me._tentacle, other],
          x: fromPos.x,
          y: fromPos.y,
          duration: Utils.getTweenDuration(toPos, fromPos, tentacleSpeed),
          ease: "sine.in",
          onComplete: () => {
            handler.apply(me);
            me._tentacle.setVisible(false);
          },
        });
      },
    });
  }
}
