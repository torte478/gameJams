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
import Boss from './Boss.js';

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

    /** @type {Phaser.GameObjects.Image} */
    _redScreen;

    /** @type {Boss} */
    _boss;

    /** @type {Phaser.Physics.Arcade.Group} */
    _handsPool;

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
        me._player = new Player(Config.Player.StartX, Config.Player.StartY, Config.Player.Speed);

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

        me._pentagram = Here._.add.image(5000, 1100, 'pentagram')
            .setDepth(Consts.Depth.Tiles);

        me._lightBulletPool = Here._.add.group();
        me._redScreen = Here._.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'red_screen')
            .setScrollFactor(0)
            .setDepth(Consts.Depth.Foreground)
            .setAlpha(0);

        me._handsPool = Here._.physics.add.group()
            .setDepth(Consts.Depth.Hands);
        me._boss = new Boss(8500, 1750, me._handsPool);

        me._createTrees();

        // init

        me._teleportTrigger = me._createTrigger(
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
                if (l.canTaked && me._player.tryTakeLight()) {
                    l.tween.pause();
                    l.light.setVisible(false);
                    l.canTaked = false;
                    me._lightPool.killAndHide(l);
                    if (me._currentLevel === 7)
                        me._killBoss();
                }
            });

        Here._.physics.add.overlap(
            me._player.toCollider(),
            me._handsPool,
            (p, h) => {
                if (!me._player._isBusy)
                    me._onHandTrigger();
            });

        Here._.physics.add.collider(
            me._player.toCollider(),
            me._boss.toCollider(),
            (p, b) => {
                if (!me._player._isBusy && me._currentLevel == 6)
                    me._onBossTouchTrigger();
            }
        )
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
                `dbg: ${me._currentLevel} ${me._player._hasLight}`;

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
                me._currentLevel === 7
                    ? Here._.cameras.main.scrollX - Consts.Viewport.Width
                    : Here._.cameras.main.scrollX,
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
        me._backBorder.update(time);

        if (me._currentLevel === 6 && me._backBorder._isCollide) {
            Utils.debugLog('effect');
            if ((time - me._backBorder._collideTime) > Config.BorderBreakDelayMs)
                me._switchLevelTo(7);
        }
    }

    _createTrigger(callback, x, y, width, height, disposed) {
        const me = this;

        return me._triggers.create(
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
        me._resetCameraAfterTeleport();
        console.log('teleport');

        if (me._currentLevel === 1)
           me._switchLevelTo(2);
    }

    _resetCameraAfterTeleport() {
        const me = this;

        Here._.cameras.main
            .setScroll(
                me._isFinalUndeground ? 0 : 100, 
                Here._.cameras.main.scrollY);
        
        me._backBorder.reset();
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

    _undegroundExitTrigger;

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

        me._undegroundExitTrigger = me._createTrigger(
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

        me._isFinalUndeground = false;
        me._startChangeCameraBoundY(
            Config.Camera.BoundGroundY, 
            Config.Camera.StartOffsetX, 
            1000);

        if (me._currentLevel === 5)
            me._switchLevelTo(6);
    }

    _onUndergroundTrigger() {
        const me = this;

        me._clearTiles(Consts.Tiles.UndegroundExit);

        me._level.setTile(128, 31, 43);
        me._level.setTile(128, 30, 33);

        me._level.setTile(129, 29, 48);
        me._level.setTile(130, 29, 48);
        me._level.setTile(131, 29, 48);
        me._level.setTile(132, 29, 48);
        me._level.setTile(133, 29, 48);
        me._level.setTile(134, 29, 48);
        me._level.setTile(135, 29, 48);
        me._level.setTile(136, 29, 48);
        me._level.setTile(137, 29, 49);

        me._level.setTile(140, 32, 31);
        me._level.setTile(140, 31, 21);
        me._level.setTile(141, 31, 22);

        me._level.setTile(142, 29, 21);
        me._level.setTile(142, 30, 31);

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

        if (me._currentLevel === 4)
            return me._initStartFromLevel4();

        if (me._currentLevel === 5)
            return me._initStartFromLevel5();

        if (me._currentLevel === 6)
            return me._initStartFromLevel6();

        if (me._currentLevel === 7)
            return me._initStartFromLevel7();

        if (me._currentLevel === 8)
            return me._initStartFromLevel8();

        throw `unknown level ${me._currentLevel}`;
    }

    _fillHoles() {
        const me = this;

        const positions = [
            Consts.Tiles.UndegroundEnter,
            Consts.Tiles.UndegroundExit,
            Consts.Tiles.FinalUndegroundEnter,
            Consts.Tiles.FinalUndegroundExit,
        ];

        const tile = 0;
        for (let index = 0; index < positions.length; ++index)
            me._fillTiles(positions[index]);
    }

    _bullets = [];

    _onPlayerGiveAwayLightTrigger() {
        const me = this;

        if (!me._player.tryGiveAwayLight())
            return;

        const playerPos = me._player.toPos();
        const bullet = Here._.add.pointlight(playerPos.x, playerPos.y, 0, 50, 0.25);
        bullet.color.setTo(Config.LightColor.R, Config.LightColor.G, Config.LightColor.B);

        me._bullets.push(bullet);
        bullet.setDepth(Consts.Depth.Player + 25);
        const targetPos = me._getBulletTargetPos();
        
        // me._player.setBusy(true); // TODO return

        Here._.tweens.timeline({
            targets: bullet,
            tweens: [
                {
                    x: 5000,
                    y: 1125,
                    duration: 1500,
                    ease: 'Sine.easeInOut'
                },
                {
                    x: targetPos.x,
                    y: targetPos.y,
                    duration: 1500,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        if (me._currentLevel !== 8) {
                            me._player.setBusy(false);
                            return;
                        }
                            
                        me._bullets.push(me._pentagram);
                        Here._.tweens.add({
                            targets: me._bullets,
                            alpha: { from: 1, to: 0 },
                            duration: 3000,
                            ease: 'Sine.easeIn',
                            onComplete: () => {
                                me._player.setBusy(false);
                                me._triggers.remove(me._teleportTrigger);
                                me._teleportCamera._camera.setVisible(false);
                            }
                        });
                    }
                }
            ]
        });

        if (me._currentLevel === 2)
            me._switchLevelTo(3);
        else if (me._currentLevel === 3)
            me._switchLevelTo(4);
        else if (me._currentLevel === 4)
            me._switchLevelTo(5);
    }

    _getBulletTargetPos() {
        const me = this;

        if (me._currentLevel <= 1)
            return Utils.buildPoint(4902, 1105);

        if (me._currentLevel == 2)
            return Utils.buildPoint(4960, 1002);

        if (me._currentLevel == 3)
            return Utils.buildPoint(5002, 994);

        if (me._currentLevel == 4)
            return Utils.buildPoint(5048, 1012);

        if (me._currentLevel == 8)
            return Utils.buildPoint(5072, 1039);

        throw `unknown level ${me._currentLevel}`;
    }

    _createLight(x, y) {
        const me = this;

        const light = Here._.add.pointlight(x, y, 0, 40, 0.25)
            .setDepth(Consts.Depth.Player);

        light.color.setTo(Config.LightColor.R, Config.LightColor.G, Config.LightColor.B);

        const sprite = me._lightPool.create(x, y, 'items', 0)
            .setDepth(Consts.Depth.Player)
            .setVisible(false);

        sprite.light = light;
        sprite.tween = Here._.add.tween({
            targets: light,
            y: y - 25,
            intensity: 1,
            yoyo: true,
            repeat: -1,
            duration: 1000
        });
        sprite.canTaked = true;

        return sprite;
    }

    _interpolate(x, y, t) {
        let t1 = t > 1 ? 2 - t : t;
        return (1 - t1) * x + t1 * y;
    }

    _onDeadEndTrigger() {
        const me = this;

        me._onPlayerDeath(
            Consts.Positions.GraveX,
            Consts.Positions.GroundY,
            me._recreateGroundTriggers,
            me);
    }

    _onHandTrigger() {
        const me = this;

        me._onPlayerDeath(
            Consts.Positions.HandsStartX,
            Consts.Positions.HandsStartY,
            me._resetHands,
            me
        );
    }

    _onBossTouchTrigger() {
        const me = this;

        me._onPlayerDeath(
            Consts.Positions.BossStartX,
            Consts.Positions.GroundY,
            me._resetBoss,
            me
        );
    }

    _resetBoss() {
        const me = this;

        me._bossAttackTween.pause();

        me._onFinalUndegroundExit();
    }

    _resetHands() {
        const me = this;

        me._boss.resetHands();
        me._createHandTriggers();
    }

    _onPlayerDeath(posX, posY, callback, context) {
        const me = this;

        me._player.setBusy(true);
        me._player.setDeath(true);
        Here._.tweens.timeline({
            targets: me._redScreen,
            tweens: [
                {
                    alpha: { from: 0, to: 1},
                    duration: 2000,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        me._player.setPosition(posX, posY);
                        me._resetCameraAfterTeleport();
                        me._cameraBoundY = Config.Camera.BoundGroundY;
                        me._nextCameraBoundY = -100;
                        me._player.setDeath(false);
                        callback.call(context);
                    }
                },
                {
                    alpha: { from: 1, to: 0},
                    duration: 2000,
                    ease: 'Sine.easeIn',
                    onComplete: () => {
                        me._player.setBusy(false);
                    }
                },
            ]
        });
    }

    _firstDeadEndTrigger = -1;
    _secondDeadEndTrigger = -1;
    _thirdDeadEndTrigger = -1;
    _isFirstWallUp = false;
    _isSecondWallUp = false;
    _isThirdWallUp = false;
    /** @type {Phaser.Physics.Arcade.StaticBody} */
    _deadEndLight;

    _recreateGroundTriggers() {
        const me = this;

        me._triggers.remove(me._firstDeadEndTrigger);
        me._triggers.remove(me._secondDeadEndTrigger);
        me._triggers.remove(me._thirdDeadEndTrigger);

        const positions = [ 
            Consts.Tiles.UndegroundFirstWallUp,
            Consts.Tiles.UndegroundFirstWallDown,
            Consts.Tiles.UndegroundSecondWallUp,
            Consts.Tiles.UndegroundSecondWallDown,
            Consts.Tiles.UndegroundThirdWallUp,
            Consts.Tiles.UndegroundThirdWallDown,
        ];
        for (let index = 0; index < positions.length; ++index)
            me._clearTiles(positions[index]);

        me._createDeadEndsWithTriggersAndLight();
    }

    _createDeadEndsWithTriggersAndLight() {
        const me = this;

        me._isFirstWallUp = me._firstDeadEndTrigger == -1 
            ? Utils.getRandom(0, 1, 0) == 0 
            : !me._isFirstWallUp;

        me._fillTiles(me._isFirstWallUp
            ? Consts.Tiles.UndegroundFirstWallUp
            : Consts.Tiles.UndegroundFirstWallDown);

        me._isSecondWallUp = me._firstDeadEndTrigger == -1 
            ? Utils.getRandom(0, 1, 0) == 0 
            : !me._isSecondWallUp;

        me._fillTiles(me._isSecondWallUp
            ? Consts.Tiles.UndegroundSecondWallUp
            : Consts.Tiles.UndegroundSecondWallDown);

        me._isThirdWallUp = me._firstDeadEndTrigger == -1 
            ? Utils.getRandom(0, 1, 0) == 0 
            : !me._isThirdWallUp;

        if (me._isFirstWallUp === me._isSecondWallUp && me._isThirdWallUp == me._isSecondWallUp)
            me._isThirdWallUp = !me._isThirdWallUp;

        me._fillTiles(me._isThirdWallUp
            ? Consts.Tiles.UndegroundThirdWallUp
            : Consts.Tiles.UndegroundThirdWallDown);

        if (!!me._deadEndLight) {
            me._deadEndLight.tween.pause();
            me._deadEndLight.light.setVisible(false);
            me._deadEndLight.canTaked = false;
            me._lightPool.killAndHide(me._deadEndLight);
        }
            
        me._deadEndLight = me._createLight(
            5825, 
            me._isThirdWallUp ? 2075 : 1875);

        me._createGroundTriggers(me._isFirstWallUp, me._isSecondWallUp, me._isThirdWallUp);
    }

    _createGroundTriggers(isFirstUp, isSecondUp, isThirdUp) {
        const me = this;

        me._firstDeadEndTrigger = me._createTrigger(
            me._onDeadEndTrigger,
            3150,
            isFirstUp ? 1880 : 2065,
            100,
            150,
            true);

        me._secondDeadEndTrigger = me._createTrigger(
            me._onDeadEndTrigger,
            4400,
            isSecondUp ? 1880 : 2065,
            100,
            150,
            true);

        me._thirdDeadEndTrigger = me._createTrigger(
            me._onDeadEndTrigger,
            5900,
            isThirdUp ? 1880 : 2065,
            100,
            150,
            true);
    }

    _onBossAppearance() {
        const me = this;

        me._player.setBusy(true);
        Here._.add.tween({
            targets: me._boss.toCollider(),
            y: 1150,
            duration: Config.BossAppearanceTimeMs,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                me._fillTiles(Consts.Tiles.FinalUndegroundEnter, 2);
                me._player.setBusy(false);
            }
        });
    }

    _fillTiles(arr) {
        const me = this;

        for (let i = 0; i < arr.length; ++i) {
            var tile = arr[i].tile;
            if (!tile)
                tile = 2;

            me._level.setTile(arr[i].x, arr[i].y, tile);
        }
            
    }

    _clearTiles(arr) {
        const me = this;

        for (let i = 0; i < arr.length; ++i) {
            me._level.setTile(arr[i].x, arr[i].y, 3);
        }
    }

    _createHandTriggers() {
        const me = this;

        me._createTrigger(
            () => me._boss.startHands(0),
            650,
            2425,
            200,
            200,
            true);

        me._createTrigger(
            () => me._boss.startHands(1),
            2625,
            2660,
            200,
            100,
            true);

        me._createTrigger(
            () => me._boss.startHands(2),
            5375,
            2925,
            100,
            300,
            true);
    }

    /** @type {Phaser.Tweens.Tween} */
    _bossAttackTween;

    _onFinalUndegroundExit() {
        const me = this;

        me._fillTiles(
            Consts.Tiles.UndegroundExit,
            0);
        
        me._boss.toCollider().y = 1150;
        me._bossAttackTween = Here._.tweens.add({
            targets: me._boss.toCollider(),
            x: { from: 8400, to: 6500 },
            duration: 25000
        });
    }

    _killBoss() {
        const me = this;

        me._player._isBusy = true;
        Here._.tweens.add({
            targets: me._boss.toCollider(),
            y: 1750,
            duration: Config.BossAppearanceTimeMs,
            ease: 'Sine.easeIn',
            onComplete: () => {
                me._nextCameraBoundY = -1;
                me._startChangeCameraBoundY(
                    Config.Camera.BoundGroundY, 
                    Config.Camera.StartOffsetX, 
                    2000);
                me._switchLevelTo(8);
                me._backBorder.reverse();
                me._player.setBusy(false);
            }
        });
    }

    _trees = [];
    _createTrees() {
        const me = this;

        const frame = 0;
        me._trees.push(
            Here._.add.sprite(6800, 1150, 'tree', frame)
                .setScale(2),
            Here._.add.sprite(7660, 1310, 'tree', frame)
                .setFlipX(true)
                .setAngle(10),
            Here._.add.sprite(700, 1250, 'tree', frame)
                .setAngle(-15)
                .setScale(1.5)
        );
    }

    // =levels

    _onPrepareBossToFightTrigger() {
        const me = this;

        if (!!me._bossAttackTween)
            me._bossAttackTween.pause();

        me._boss.toCollider().x = 1100;
        me._boss.toCollider().y = 1150;
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

        if (next == 4)
            return me._initLevel4();

        if (next == 5)
            return me._initLevel5();

        if (next == 6)
            return me._initLevel6();

        if (next == 7)
            return me._initLevel7();

        if (next == 8)
            return me._initLevel8();

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

        me._createLight(3500, 1175);

        // me._player.setPosition(2625, Consts.Positions.GroundY);
        me._player.setPosition(6000, Consts.Positions.GroundY);
        // me._player.tryTakeLight();
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

        me._player.setPosition(Consts.Positions.PentagramX, Consts.Positions.GroundY);
        me._player.tryTakeLight();
        me._initLevel3();
    }

    _initLevel3() {
        const me = this;

        me._createLight(6250, 1150);

        me._level.setTile(36, 27, 8);
        me._level.setTile(37, 27, 9);
        me._level.setTile(36, 28, 18);
        me._level.setTile(37, 28, 19);
    }

    _initStartFromLevel4() {
        const me = this;

        me._player.tryTakeLight();
        me._player.setPosition(Consts.Positions.PentagramX, Consts.Positions.GroundY);
        me._initLevel4();
    }

    _initLevel4() {
        const me = this;

        me._clearTiles(Consts.Tiles.UndegroundEnter);
        me._level.setTile(31, 29, 23);
        me._level.setTile(31, 30, 33);
        me._level.setTile(31, 31, 33);
        me._level.setTile(35, 29, 21);
        me._level.setTile(35, 30, 31);
        me._level.setTile(35, 31, 41);

        me._createDeadEndsWithTriggersAndLight();
    }

    _initStartFromLevel5() {
        const me = this;

        me._player.setPosition(Consts.Positions.FinalUndergroundX, Consts.Positions.GroundY);
        // me._player.setPosition(400, 2440);
        // me._player.setPosition(5235, 2940);
        me._player.setPosition(6925, 1590);

        me._isFinalUndeground = true;
        me._fillTiles(Consts.Tiles.FinalUndegroundExit, 2);
        me._fillTiles(Consts.Tiles.UndegroundExit, 2);
        me._initLevel5();
    }

    _fakeLight = null;

    _bossAppearanceTrigger = -1;

    _initLevel5() {
        const me = this;

        me._bossAppearanceTrigger = me._createTrigger(
            me._onBossAppearance,
            8225,
            1000,
            150,
            800,
            true
        );

        me._fakeLight = me._createLight(8500, 1375);
        me._nextCameraBoundY = -1;           

        me._createHandTriggers();
    }

    _initStartFromLevel6() {
        const me = this;

        me._player.setPosition(Consts.Positions.BossStartX, Consts.Positions.GroundY);

        me._initLevel6();
    }

    _initLevel6() {
        const me = this;

        me._createTrigger(
            me._onFinalUndegroundExit,
            7300,
            1350,
            200,
            200,
            true);
    }

    _initStartFromLevel7() {
        const me = this;

        throw `not supported. use 6`;
        me._player.setPosition(Consts.Positions.BossStartX, Consts.Positions.GroundY);
        me._initLevel7();
    }

    _initLevel7() {
        const me = this;

        if (me._bossAppearanceTrigger != -1)
            me._triggers.remove(me._bossAppearanceTrigger);

        if (!!me._fakeLight) 
            me._lightPool.killAndHide(me._fakeLight);

        me._nextCameraBoundY = -1;
        me._backBorder.reverse();
        me._createLight(1500, 1400);
        me._startChangeCameraBoundY(
            Config.Camera.BoundGroundY, 
            Config.Camera.ReverseOffset, 
            2000);

        me._createTrigger(
            me._onPrepareBossToFightTrigger,
            2100, 
            1400,
            200,
            200,
            true);
    }

    _initStartFromLevel8() {
        const me = this;

        me._player.setPosition(Consts.Positions.GraveX, Consts.Positions.GroundY);
        me._player.tryTakeLight();
        me._initLevel8();       
    }

    _initLevel8() {
        const me = this;

        console.log(8);
    }
}