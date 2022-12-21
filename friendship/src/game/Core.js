import Phaser from '../lib/phaser.js';

import Audio from './utils/Audio.js';
import Utils from './utils/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import GunLogic from './GunLogic.js';
import Enemy from './Enemy.js';
import Controls from './Controls.js';
import Player from './Player.js';
import ContainerSpawn from './ContainerSpawn.js';
import EnemyCatcher from './EnemyCatcher.js';
import GUI from './GUI.js';
import PlayerTrigger from './PlayerTrigger.js';
import Callback from './Callback.js';
import Hub from './Hub.js';
import SquareBehabiour from './SquareBehabiour.js';
import TriangleBehaviour from './TriangleBehaviour.js';
import CircleBehaviour from './CircleBehaviour.js';
import Enums from './Enums.js';
import Laser from './Laser.js';
import Graphics from './Graphics.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Audio} */
    _audio;

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Object[]} */
    _toUpdate;

    /** @type {Controls} */
    _controls;

    /** @type {Player} */
    _player;

    /** @type {GunLogic} */
    _gunLogic;

    /** @type {Phaser.GameObjects.Image} */
    _background;

    /** @type {Hub} */
    _hub;

    /** @type {Graphics} */
    _graphics;

    /** @type {Phaser.GameObjects.Image} */
    _boss;

    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;
        me._audio = new Audio(scene);

        me._background = scene.add.image(scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'background')
            .setDepth(Consts.Depth.Background)
            .setScrollFactor(0);

        scene.add.image(300, 1600, 'cave', 0)
            .setDepth(Consts.Depth.Background);

        scene.add.image(300, 1600, 'cave', 1)
            .setDepth(Consts.Depth.Tiles + 100);

        me._boss = scene.add.image(200, 1650, 'boss', 0)
            .setDepth(Consts.Depth.Background + 10);

        const bulletGroup = new Phaser.Physics.Arcade.Group(scene.physics.world, scene);
        const gunLogic = new GunLogic(scene, bulletGroup, Config.Start.StartGunCharge, me._audio);
        me._gunLogic = gunLogic;

        me._controls = new Controls(scene.input);
        me._player = new Player(
            scene, 
            Config.Start.Player.x, 
            Config.Start.Player.y, 
            me._controls,
            gunLogic,
            me._audio);

        me._graphics = new Graphics(scene);

        me._toUpdate = [];

        const hubPos = { x: 2400, y : 1600 };
        scene.add.image(hubPos.x, hubPos.y, 'hub_outside').setDepth(Consts.Depth.Hub);
        scene.add.image(hubPos.x, hubPos.y, 'hub_outside_top').setDepth(Consts.Depth.HubTop);

        const hubEnterTrigger = new PlayerTrigger(
            scene,
            Config.Start.HubEnterTrigger,
            me._controls,
            new Callback(null, me),
            new Callback(me._enterHub, me),
            new Callback(null, me));

        me._toUpdate.push(hubEnterTrigger);

        const hubExitTrigger = new PlayerTrigger(
            scene,
            Config.Hub.ExitTrigger,
            me._controls,
            new Callback(null, me),
            new Callback(me._exitHub, me),
            new Callback(null, me));

        me._toUpdate.push(hubExitTrigger);

        /** @type {Phaser.Tweens.Tween} */
        let bossTween = null;
        const bossTrigger = new PlayerTrigger(
            scene,
            Config.Start.BossTrigger,
            me._controls,
            new Callback(() => { 
                if (!!bossTween)
                    bossTween.pause();

                bossTween = scene.add.tween({
                    targets: me._boss,
                    x: 700,
                    duration: 1000,
                    ease: 'Sine.easeInOut',
                    onComplete: () => { bossTween = null; }
                });
            }, me),
            new Callback(null, me),
            new Callback(() => { 
                if (!!bossTween)
                    bossTween.pause();

                bossTween = scene.add.tween({
                    targets: me._boss,
                    x: 200,
                    duration: 1000,
                    ease: 'Sine.easeInOut',
                    onComplete: () => { bossTween = null; }
                });
                
            }, me),
            true);

        me._toUpdate.push(bossTrigger);

        const hubFireTrigger = new PlayerTrigger(
            scene,
            Config.Hub.FireTrigger,
            me._controls,
            new Callback(null, me),
            new Callback(() => { me._player.toggleAnimation(Enums.PlayerAnimation.FIRE) }, me),
            new Callback(null, me));

        me._toUpdate.push(hubFireTrigger);

        me._level = scene.make.tilemap({
            key: 'level',
            tileWidth: Consts.Unit,
            tileHeight: Consts.Unit
        });
        const tileset = me._level.addTilesetImage('tilemap');
        const tiles = me._level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Tiles);

        scene.cameras.main
            .setRoundPixels(true)
            .startFollow(me._player.toGameObject(), true, 1, 1)
            .setBounds(0, 0, me._level.widthInPixels, me._level.heightInPixels);

        scene.physics.world.setBounds(0, 0, me._level.widthInPixels, me._level.heightInPixels);
        const hub = new Hub(scene, scene.cameras.main.getBounds(), me._audio);
        me._hub = hub;

        for (let i = 0; i < Consts.CollideTiles.length; ++i) {
            const tileIndex = Consts.CollideTiles[i];
            me._level.setCollision(tileIndex);
        }

        const laser = gunLogic.getLaser();
        me._toUpdate.push(laser);

        const particles = scene.add.particles('particle').setDepth(Consts.Depth.Laser);

        const particleEmmiter = particles.createEmitter();
        particleEmmiter.setPosition(Config.Start.Player.x, Config.Start.Player.y);
        particleEmmiter.setSpeed(400);
        particleEmmiter.setBlendMode(Phaser.BlendModes.ADD);
        particleEmmiter.on = false;

        /** @type {Phaser.Time.TimerEvent} */
        let particleTimer = null;

        const enemyCatcher = new EnemyCatcher(
            scene, 
            Config.Start.EnemyCatcher.x,
            Config.Start.EnemyCatcher.y,
            Config.Start.EnemyCatcher.zone,
            laser,
            me._audio);
        me._toUpdate.push(enemyCatcher);
        me._enemyCatcher = enemyCatcher;

        const gui = new GUI(scene, gunLogic, enemyCatcher);
        me._gui = gui;
        me._toUpdate.push(gui);

        const enemyGroup = new Phaser.Physics.Arcade.Group(scene.physics.world, scene);
        const containerGroup = new Phaser.Physics.Arcade.Group(scene.physics.world, scene);

        const containerSpawn = new ContainerSpawn(scene, containerGroup, Utils.buildPoint(
            Config.Start.ContainerSpawn.x,
            Config.Start.ContainerSpawn.y),
            me._controls,
            0,
            me._audio);
        me._toUpdate.push(containerSpawn);

        // for (let i = 0; i < Config.Start.Containers.length; ++i) {
        //     const pos = Config.Start.Containers[i];
        //     containerSpawn.spawn(pos.x, pos.y);
        // }

        for (let i = 0; i < Config.Start.Squares.length; ++i) {
            const pos = Config.Start.Squares[i];
            const square = new Enemy(scene, enemyGroup, pos.x, pos.y, new SquareBehabiour());
            me._toUpdate.push(square);
        }

        for (let i = 0; i < Config.Start.Triangles.length; ++i) {
            const config = Config.Start.Triangles[i];
            const pos = config.pos;
            const triangle = new Enemy(
                scene,
                enemyGroup,
                pos.x,
                pos.y,
                new TriangleBehaviour(config.left, config.right)
            );
            me._toUpdate.push(triangle);
        };

        for (let i = 0; i < Config.Start.Circles.length; ++i) {
            const config = Config.Start.Circles[i];
            const circle = new Enemy(
                scene,
                enemyGroup,
                config.x,
                config.y,
                new CircleBehaviour(scene, config.x, config.y, config.r, config.color)
            );
            me._toUpdate.push(circle);
        }

        const invisibleGroup = new Phaser.Physics.Arcade.StaticGroup(scene.physics.world, scene);
        /** @type {Phaser.Physics.Arcade.Sprite} */
        var wall1 = invisibleGroup.create(2500, 1250, 'collider');
        wall1.setVisible(false);

        /** @type {Phaser.Physics.Arcade.Sprite} */
        var wall2 = invisibleGroup.create(2000, 1600, 'collider');
        wall2.setVisible(false);
        wall2.body.setSize(100, 1000);
            

        scene.physics.add.collider(
            enemyGroup,
            tiles);

        scene.physics.add.collider(
            containerGroup, 
            containerGroup,
            (first, second) => {
                first.owner.stopAccelerate();
                second.owner.stopAccelerate();
                laser.checkHide(first);
                laser.checkHide(second);
                me._audio.play('hit');
            });

        scene.physics.add.collider(
            containerGroup,
            tiles,
            (m, t) => {
                m.owner.stopAccelerate();
                laser.checkHide(m)
                me._audio.play('hit');
            }
        );

        scene.physics.add.collider(
            containerGroup,
            invisibleGroup,
            (m, t) => {
                m.owner.stopAccelerate();
                laser.checkHide(m)
                me._audio.play('hit');
            }
        );

        scene.physics.add.overlap(
            enemyGroup, 
            containerGroup,
            (e, c) => {
                const size = e.owner.getSize();
                if (c.owner.isFree(size)) {
                    e.owner.backToPool();
                    c.owner.catchEnemy(size, e.owner.getType());
                    laser.checkHide(c);

                    me._audio.play('enemy_catched');

                    particleEmmiter.setPosition(c.x, c.y);
                    particleEmmiter.on = true;
                    if (!!particleTimer)
                        particleTimer.destroy();

                    particleTimer = scene.time.delayedCall(400, () => {
                        particleEmmiter.on = false;
                        particleTimer.destroy();
                        particleTimer = null;
                    }, me);
                }
            });

        scene.physics.add.collider(
            me._player.toGameObject(),
            tiles
        );

        scene.physics.add.collider(
            me._player.toGameObject(),
            hub.getTiles()
        );

        scene.physics.add.collider(
            bulletGroup,
            tiles,
            (b, e) => {
                gunLogic.onWallCollide(b);
            });

        scene.physics.add.collider(
            bulletGroup,
            invisibleGroup,
            (b, e) => {
                gunLogic.onWallCollide(b);
            });

        scene.physics.add.overlap(
            bulletGroup,
            containerGroup,
            (b, c) => {
                gunLogic.onContainerCollide(b, c);
            }
        );

        if (Config.Start.InsideHub)
            me._enterHub();

        me._audio.play('music1', { volume: 0.3, loop: true });

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = scene.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });
    }

    _runEnding = false;

    update(delta) {
        const me = this;

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            let text =
                `mse: ${me._scene.input.activePointer.worldX | 0} ${me._scene.input.activePointer.worldY | 0}\n` +
                `plr: ${me._player.toGameObject().x | 0} ${me._player.toGameObject().y | 0}\n` +
                `gun: ${me._gunLogic._charge | 0}`;

            me._log.setText(text);
        });

        if (me._runEnding)
            return;

        if (me._enemyCatcher._stat[0] > 0 
            && me._enemyCatcher._stat[1] > 0 
            && me._enemyCatcher._stat[2] > 0)
            me.runGameOver();

        Config.WasTriggerAction = false;
        
        me._controls.update();

        for (let i = 0; i < me._toUpdate.length; ++i)
            me._toUpdate[i].update(delta);

        me._player.update(delta);
    }

    _enterHub() {
        const me = this;

        me._player.isBusy = true;
        me._player._container.body.setVelocity(0);
        me._player._sprite.play('player_idle');
        me._audio.stop('walk_snow');
        me._audio.play('action');

        me._graphics.runFade(
            new Callback(() => {
                me._background.setVisible(false);
                me._hub.enter(me._player);
            }, me),
            new Callback(() => {
                me._hub.startCharge(me._player);
            }, me)
        );
    }

    _exitHub() {
        const me = this;

        me._player.isBusy = true;
        me._player._container.body.setVelocity(0);
        me._player._insideSprite.play('player_idle_inside');
        me._audio.play('action');

        me._graphics.runFade(
            new Callback(() => {
                me._background.setVisible(true);
                me._hub.exit(me._player);
            }, me),
            new Callback(() => {
                me._player.isBusy = false;
            }, me)
        );
    }

    runGameOver() {
        const me = this;

        me._runEnding = true;

        me._player.isBusy = true;
        me._audio.stop('walk_snow');
        me._audio.ignoreShit = true;
        me._player.toGameObject().body.setVelocity(0);
        
        me._graphics.runFade(
            new Callback(() => {
                me._audio.stop('music1');

                me._player.isBusy = true;
                me._player.toGameObject().body.setVelocity(0);
                me._player._sprite.play('player_idle').setFlipX(true);
                me._player._gun.setFlipX(true);
                me._player._container.setPosition(1800, 1850);

                me._audio.stop('walk_snow');

                me._scene.cameras.main.stopFollow().setScroll(900, 1200);
                me._gui.hide();
            }, me),
            new Callback(() => {
                me.runGameOver1();
            }, me));
    }

    runGameOver1() {
        const me = this;

        me._audio.play('music3', { loop: -1, volume: 0.25 });

        me._boss.setPosition(600, me._boss.y);

        const tweens = [];
        tweens.push({
            targets: me._boss,
            x: 1150,
            duration: 2000,
            ease: 'Sine.easeInOut'
        });

        const spawn = new Phaser.Geom.Point(2600, 1600);
        const square = me._scene.add.image(spawn.x, spawn.y, 'square', 3)
            .setFlipX(true);

        const treeX = 1530;

        tweens.push({
            targets: square,
            x: treeX,
            y: 1850,
            duration: 1000,
            ease: 'Sine.easeOut'
        });

        const triangles = [
            { y: 1700, scale: 1.5 },
            { y: 1610, scale: 1.2 },
            { y: 1550, scale: 1}
        ];

        for (let i = 0; i < triangles.length; ++i) {
            const triangle = me._scene.add.image(spawn.x, spawn.y, 'triangle', 6)
                .setFlipX(true)
                .setScale(triangles[i].scale);

            tweens.push({
                targets: triangle,
                x: treeX,
                y: triangles[i].y,
                duration: 1000,
                ease: 'Sine.easeOut'
            });
        }

        const circles = [
            { x: 1615, y: 1710 },
            { x: 1425, y: 1795 },
            { x: 1627, y: 1780 },
            { x: 1532, y: 1739 },
            { x: 1441, y: 1700 },
            { x: 1525, y: 1616 }
        ];

        for (let i = 0; i < circles.length; ++i) {
            const circle = me._scene.add.image(spawn.x, spawn.y, 'circle', 6 + ((i + 1) % 3))
                .setFlipX(true);

            tweens.push({
                targets: circle,
                x: circles[i].x,
                y: circles[i].y,
                duration: 400,
                ease: 'Sine.easeOut'
            });
        }

        const bossY = me._boss.y;

        me._scene.tweens.timeline({
            tweens: tweens,
            onComplete: () => {
                me._boss.setFrame(1);

                me._scene.add.text(1550, 1300, 'Merry Christmas', { fontSize: 72})
                    .setOrigin(0.5)
                    .setStroke('#6a7798', 8);

                me._scene.tweens.add({
                    targets: me._boss,
                    y: bossY + 10,
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
            }
        });
    }
}