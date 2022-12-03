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

        const bulletGroup = new Phaser.Physics.Arcade.Group(scene.physics.world, scene);
        const gunLogic = new GunLogic(scene, bulletGroup, Config.Start.GunCharge, me._audio);
        me._gunLogic = gunLogic;

        me._controls = new Controls(scene.input);
        me._player = new Player(
            scene, 
            Config.Start.Player.x, 
            Config.Start.Player.y, 
            me._controls,
            gunLogic,
            me._audio);

        me._toUpdate = [];

        const hubEnterTrigger = new PlayerTrigger(
            scene,
            Config.Start.HubEnterTrigger,
            me._controls,
            new Callback(() => { console.log('enter')}, me),
            new Callback(() => { hub.enter(me._player) }, me),
            new Callback(() => { console.log('exit')}, me));

        me._toUpdate.push(hubEnterTrigger);

        const hubExitTrigger = new PlayerTrigger(
            scene,
            Config.Hub.ExitTrigger,
            me._controls,
            new Callback(() => { console.log('enter')}, me),
            new Callback(() => { hub.exit(me._player) }, me),
            new Callback(() => { console.log('exit')}, me));

        me._toUpdate.push(hubExitTrigger);

        const hubFireTrigger = new PlayerTrigger(
            scene,
            Config.Hub.FireTrigger,
            me._controls,
            new Callback(() => { console.log('enter')}, me),
            new Callback(() => { me._player.runAnimation(Enums.PlayerAnimation.FIRE) }, me),
            new Callback(() => { console.log('exit')}, me));

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
        const hub = new Hub(scene, scene.cameras.main.getBounds());

        for (let i = 0; i < Consts.CollideTiles.length; ++i) {
            const tileIndex = Consts.CollideTiles[i];
            me._level.setCollision(tileIndex);
        }

        const enemyCatcher = new EnemyCatcher(
            scene, 
            Config.Start.EnemyCatcher.x,
            Config.Start.EnemyCatcher.y,
            Config.Start.EnemyCatcher.zone);
        me._toUpdate.push(enemyCatcher);

        const gui = new GUI(scene, gunLogic, enemyCatcher);
        me._toUpdate.push(gui);

        const enemyGroup = new Phaser.Physics.Arcade.Group(scene.physics.world, scene);
        const containerGroup = new Phaser.Physics.Arcade.Group(scene.physics.world, scene);

        const containerSpawn = new ContainerSpawn(scene, containerGroup, Utils.buildPoint(
            Config.Start.ContainerSpawn.x,
            Config.Start.ContainerSpawn.y));
        me._toUpdate.push(containerSpawn);

        for (let i = 0; i < Config.Start.Containers.length; ++i) {
            const pos = Config.Start.Containers[i];
            containerSpawn.spawn(pos.x, pos.y);
        }

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
                new CircleBehaviour(scene, config.x, config.y, config.r)
            );
            me._toUpdate.push(circle);
        }

        scene.physics.add.collider(
            enemyGroup,
            tiles);

        scene.physics.add.collider(
            containerGroup, 
            containerGroup,
            (first, second) => {
                first.owner.stopAccelerate();
                second.owner.stopAccelerate();
            });

        scene.physics.add.collider(
            containerGroup,
            tiles,
            (m, t) => {
                m.owner.stopAccelerate();
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

        scene.physics.add.overlap(
            bulletGroup,
            containerGroup,
            (b, c) => {
                gunLogic.onContainerCollide(b, c);
            }
        );

        if (Config.Start.InsideHub)
            hub.enter(me._player);

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = scene.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });
    }

    update(delta) {
        const me = this;
        
        me._controls.update();

        for (let i = 0; i < me._toUpdate.length; ++i)
            me._toUpdate[i].update(delta);

        me._player.update(delta);

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            let text =
                `mse: ${me._scene.input.activePointer.worldX | 0} ${me._scene.input.activePointer.worldY | 0}\n` +
                `plr: ${me._player.toGameObject().x | 0} ${me._player.toGameObject().y | 0}\n` +
                `gun: ${me._gunLogic._charge | 0}`;

            me._log.setText(text);
        });
    }
}