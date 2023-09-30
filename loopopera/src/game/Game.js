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

    /** @type {Level} */
    _level;

    /** @type {Phaser.GameObjects.Group} */
    _lightBulletPool;

    constructor() {
        const me = this;

        // debug

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(10, 10, '', { fontSize: 18, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });

        // create

        me._level = new Level();
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
            .setDepth(Consts.Depth.Foreground)
            .setVisible(false);

        const penragram = Here._.add.image(5000, 1100, 'pentagram')
            .setDepth(Consts.Depth.Tiles);

        me._lightBulletPool = Here._.add.group();

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

        if (Utils.isDebug(Config.Debug.Position))
            me._player.setPosition(Config.Debug.DebugX, Config.Debug.DebugY);

        // physics

        Here._.physics.add.collider(
            me._player.toCollider(), 
            me._level.getCollider());

        Here._.physics.add.overlap(
            me._player.toCollider(),
            me._lightPool,
            (p, l) => {
                if (l.visible && me._player.tryTakeLight())
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

            const tile = me._leve

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` + 
                `plr: ${me._player._container.x | 0} ${me._player._container.y | 0}\n` +
                `dbg: ${me._currentLevel}`;

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

        if (me._currentLevel === 1)
           me._switchLevelTo(2);
    }

    /** @type {Phaser.Time.TimerEvent} */
    _cameraBoundChangeTimedEvent;

    /** @type {Number} */
    _cameraBoundY;

    /** @type {Number} */
    _nextCameraBoundY = 0;

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

        me._cameraBoundChangeTimedEvent = Here._.time.delayedCall(duration, () => {
            me._cameraBoundChangeTimedEvent = null;
        }, [], me);
    }

    _initGame() {
        const me = this;

        me._createTrigger(
            me._onPlayerGiveAwayLightTrigger,
            4725,
            1200,
            200,
            400,
            false);

        me._fillHoles();

        me._currentLevel = Config.StartLevel;
        
        if (me._currentLevel === 0)
            return me._initStartFromLevel0();

        if (me._currentLevel === 1)
            return me._initStartFromLevel1();

        if (me._currentLevel === 2)
            return me._initStartFromLevel2();

        if (me._currentLevel === 3)
            return me._initStartFromLevel3();

        throw `unknown level ${me._currentLevel}`;
    }

    _fillHoles() {
        const me = this;

        // undeground enter
        for (let i = 0; i < 3; ++i)
            me._level.setTile(32 + i, 29, 0);

        // undeground exit
        for (let i = 0; i < 4; ++i)
            me._level.setTile(138 + i, 29, 0);

        // super undeground enter
        for (let i = 0; i < 3; ++i)
            me._level.setTile(161 + i, 29, 0);
    }

    _onPlayerGiveAwayLightTrigger() {
        const me = this;

        if (!me._player.tryGiveAwayLight())
            return;

        const playerPos = me._player.toPos();
        /** @type {Phaser.GameObjects.Image} */
        const bullet = me._lightBulletPool.create(playerPos.x, playerPos.y, 'items', 0);
        bullet.setDepth(Consts.Depth.Player + 25);
        const targetPos = me._getBulletTargetPos();
        Here._.tweens.timeline({
            targets: bullet,
            tweens: [
                {
                    x: 5000,
                    y: 1150,
                    duration: 1500,
                    ease: 'Sine.easeInOut'
                },
                {
                    x: targetPos.x,
                    y: targetPos.y,
                    duration: 1500,
                    ease: 'Sine.easeInOut'
                }
            ]
        });

        if (me._currentLevel === 2)
            me._switchLevelTo(3);
        else if (me._currentLevel === 3)
            me._switchLevelTo(4);
    }

    _getBulletTargetPos() {
        const me = this;

        if (me._currentLevel <= 1)
            return Utils.buildPoint(4861, 1099);

        if (me._currentLevel == 2)
            return Utils.buildPoint(4927, 990);

        if (me._currentLevel == 3)
            return Utils.buildPoint(5000, 963);

        throw `unknown level ${me._currentLevel}`;
    }

    _createLight(x, y) {
        const me = this;

        return me._lightPool.create(x, y, 'items', 0);
    }

    _switchLevelTo(next) {
        const me = this;

        me._currentLevel = next;

        if (next == 1)
            return;

        if (next == 2)
            return me._initLevel2();

        if (next == 3)
            return me._initLevel3();

        throw `unknown level ${next}`;
    }

    _initStartFromLevel0() {
        const me = this;

        me._startScreenHiding = false;
        me._startScreen.setVisible(true);

        me._player.setPosition(2625, 1390);
        me._player.setBusy(true);
        
        me._createLight(3500, 1175);

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
                    me._player.setBusy(false);
                    me._switchLevelTo(1);
                }
            })
        }, me);
    }


    _initStartFromLevel1() {
        const me = this;

        me._player.setPosition(4400, 1390);
        me._player.tryTakeLight();
    }

    _initStartFromLevel2() {
        const me = this;

        me._player.setPosition(5000, 1390);
        me._initLevel2();
    }

    _initLevel2() {
        const me = this;

        me._createLight(5400, 1350);
    }

    _initStartFromLevel3() {
        const me = this;

        me._player.setPosition(Consts.Positions.GraveX, Consts.Positions.GroundY);
        // me._player.tryTakeLight();
        me._initLevel3();
    }

    _initLevel3() {
        const me = this;

        me._createLight(6250, 1150);

        // first grave
        for (let i = 0; i < 2; ++i)
            for (let j = 0; j < 2; ++j)
                me._level.setTile(36 + i, 27 + j, 0);
    }
}