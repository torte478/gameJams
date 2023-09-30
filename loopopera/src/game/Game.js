import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Level from './Level.js';
import Player from './Player.js';
import Triggers from './Triggers.js';
import TeleportCamera from './TeleportCamera.js';
import Border from './Border.js';

export default class Game {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Player} */
    _player;

    /** @type {TeleportCamera} */
    _teleportCamera;

    /** @type {Border} */
    _backBorder;

    /** @type {Triggers} */
    _triggers;

    /** @type {Boolean} */
    _isFinalUndeground = false;

    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    _lightPool;

    /** @type {Phaser.GameObjects.Image} */
    _startScreen;

    /** @type {Boolean} */
    _startScreenHiding = true;

    constructor() {
        const me = this;

        // debug

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(10, 10, '', { fontSize: 18, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });

        // create

        const level = new Level();
        me._player = new Player(Config.Player.StartX, Config.Player.StartY);

        Here._.cameras.main.startFollow(
            me._player.toCollider(),
            true,
            1,
            1,
            Config.Camera.StartOffsetX,
            0)
            .setBackgroundColor(Config.BackgroundColor);

        me._cameraBoundY = Config.Camera.StartBoundY;
        me._cameraOffsetX = Config.Camera.StartOffsetX;

        me._teleportCamera = new TeleportCamera(me._player, Config.WorldBorder, me._log);
        me._backBorder = new Border(me._player, -200);

        me._lightPool = Here._.physics.add.staticGroup();
        me._triggers = new Triggers(me._player);

        me._startScreen = Here._.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'start_screen')
            .setScrollFactor(0)
            .setDepth(Consts.Depth.Max)
            .setVisible(false);

        // init

        me._createTrigger(
            me._onTeleportTrigger,
            Config.WorldBorder + Consts.Unit.Normal, 
            1600, 
            Consts.Unit.Big, 
            3200, 
            false);

        me._createCameraBoundYTriggers();

        if (Utils.isDebug(Config.Debug.IsFinalUndeground))
            me._onFinalUndergroundTrigger();

        me._initGame();

        // physics

        Here._.physics.add.collider(
            me._player.toCollider(), 
            level.getCollider());

        Here._.physics.add.overlap(
            me._player.toCollider(),
            me._lightPool,
            (p, l) => {
                if (me._player.tryTakeLight())
                    me._lightPool.killAndHide(l);
            });
    }

    update(time) {
        const me = this;

        if (Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) 
            && Utils.isDebug(Config.Debug.Global))
            Here._.scene.restart({ isRestart: true });

        me._updateInternal(time);

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            const mouse = Here._.input.activePointer;

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` + 
                `plr: ${me._player._container.x | 0} ${me._player._container.y | 0}\n` +
                `dbg: ${Here._.cameras.main.scrollX | 0} ${Here._.cameras.main.scrollY | 0}`;

            me._log.setText(text);
        });
    }

    _updateInternal(time) {
        const me = this;

        me._player.update(time);
        me._updateCameraBounds();

        if (!me._isFinalUndeground) {
            Here._.cameras.main
            .setBounds(
                Here._.cameras.main.scrollX,
                me._cameraBoundY,
                2 * Consts.Viewport.Width,
                Consts.Viewport.Height)
            .setFollowOffset(
                me._cameraOffsetX,
                0);
        }
        else {
            Here._.cameras.main
                .setBounds(
                    Here._.cameras.main.scrollX,
                    0,
                    2 * Consts.Viewport.Width,
                    64 * Consts.Unit.Normal)
        }

        me._teleportCamera.update();
        me._backBorder.update();
    }

    _createTrigger(callback, x, y, width, height, disposed) {
        const me = this;

        me._triggers.create(
            callback,
            me,
            x, 
            y, 
            width, 
            height, 
            disposed);
    }

    _onTeleportTrigger() {
        const me = this;

        me._player.teleport(Config.WorldStartX);
        me._teleportCamera.reset();
        Here._.cameras.main
            .setScroll(
                me._isFinalUndeground ? 0 : 100, 
                Here._.cameras.main.scrollY);
        me._backBorder.reset();
        console.log('teleport');
    }

    /** @type {Phaser.Time.TimerEvent} */
    _cameraBoundChangeTimedEvent;

    /** @type {Number} */
    _cameraBoundY;

    /** @type {Number} */
    _nextCameraBoundY;

    /** @type {Number} */
    _oldCameraBoundY;

    /** @type {Number} */
    _cameraOffsetX;

    /** @type {Number} */
    _oldCameraOffsetX;

    /** @type {Number} */
    _nextCameraOffsetX;

    /** @type {Number} */
    _currentLevel;

    _updateCameraBounds() {
        const me = this;

        if (!me._cameraBoundChangeTimedEvent)
            return;

        const progress = me._cameraBoundChangeTimedEvent.getProgress();

        me._cameraBoundY = me._oldCameraBoundY 
                           + (me._nextCameraBoundY - me._oldCameraBoundY) * progress;
        me._cameraOffsetX = me._oldCameraOffsetX
                           + (me._nextCameraOffsetX - me._oldCameraOffsetX) * progress;
    }

    _createCameraBoundYTriggers() {
        const me = this;

        me._createTrigger(
            me._onRoofTrigger,
            2640,
            750,
            200,
            200,
            false);

        me._createTrigger(
            me._onGroundTrigger,
            5650,
            910,
            1500,
            150,
            false);

        me._createTrigger(
            me._onUndergroundTrigger,
            1675,
            1600,
            200,
            100,
            false);

        me._createTrigger(
            me._onGroundTrigger,
            7250,
            1350,
            200,
            200,
            false);

        me._createTrigger(
            me._onFinalUndergroundTrigger,
            8125,
            1575,
            200,
            200,
            false);
    }

    _onRoofTrigger() {
        const me = this;

        me._startChangeCameraBoundY(
            Config.Camera.BoundRoofY, 
            Config.Camera.SecondOffsetX, 
            2000);
    }

    _onGroundTrigger() {
        const me = this;

        me._startChangeCameraBoundY(
            Config.Camera.BoundGroundY, 
            Config.Camera.StartOffsetX, 
            1000);
    }

    _onUndergroundTrigger() {
        const me = this;

        me._startChangeCameraBoundY(
            Config.Camera.BoundUndergroundY, 
            Config.Camera.SecondOffsetX, 
            2000);
    }

    _onFinalUndergroundTrigger() {
        const me = this;

        me._isFinalUndeground = true;

        Here._.cameras.main
            .startFollow(
                me._player.toCollider(),
                true,
                0.5,
                0.5,
                Config.Camera.SecondOffsetX,
                0)
            .setBounds(
                Here._.cameras.main.scrollX,
                0,
                2 * Consts.Viewport.Width,
                64 * Consts.Unit.Normal);
    }

    _startChangeCameraBoundY(targetBoundY, targetOffsetX, duration) {
        const me = this;
        
        if (!!me._cameraBoundChangeTimedEvent || Math.abs(me._nextCameraBoundY - targetBoundY) < 10)
            return;
        
        me._oldCameraOffsetX = me._cameraOffsetX;
        me._nextCameraOffsetX = targetOffsetX;

        me._oldCameraBoundY = me._cameraBoundY;
        me._nextCameraBoundY = targetBoundY;

        me._timedEvent = Here._.time.delayedCall(duration, () => {
            me._cameraBoundChangeTimedEvent = null;
        }, [], me);
    }

    _initGame() {
        const me = this;

        // triggers.create(600, 700, 200, 200, false, () => {
            //     if (me._player.tryGiveAwayLight())
            //         Utils.debugLog('light');
            // }, me);

        me._currentLevel = Config.StartLevel;
        
        if (me._currentLevel === 0)
            return me._initLevel0();

        if (me._currentLevel === 1)
            return me._initLevel1();

        throw `unknown level ${me._currentLevel}`;
    }

    _initLevel0() {
        const me = this;

        me._startScreenHiding = false;
        me._startScreen.setVisible(true);

        me._player.setBusy(true);
        me._lightPool.create(3500, 1175, 'items', 0);

        Here._.input.keyboard.on('keydown', () => {
            if (me._startScreenHiding)
                return;
            me._startScreenHiding = true;

            Here._.add.tween({
                targets: me._startScreen,
                alpha: { from: 1, to: 0 },
                duration: 2000,
                ease: 'Sine.easeOut'
            });

            Here._.add.tween({
                targets: me._player.toCollider(),
                x: { from: 2625, to: 2800},
                duration: 2000,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    console.log('foo');
                    me._player.setBusy(false);
                    me._currentLevel = 1;
                }
            })
        }, me);
    }

    _initLevel1() {
        const me = this;
    }
}