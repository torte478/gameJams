import Phaser from '../lib/phaser.js';

import Audio from './utils/Audio.js';
import Utils from './utils/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import GunLogic from './GunLogic.js';
import Movable from './Movable.js';
import Enemy from './Enemy.js';
import Container from './Container.js';
import Controls from './Controls.js';
import Player from './Player.js';
import EnemyBehaviour from './EnemyBehaviour.js';
import ContainerSpawn from './ContainerSpawn.js';

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

    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;
        me._audio = new Audio(scene);

        const bulletGroup = new Phaser.Physics.Arcade.Group(scene.physics.world, scene);
        const gunLogic = new GunLogic(scene, bulletGroup);

        me._controls = new Controls(scene.input);
        me._player = new Player(
            scene, 
            Config.Start.Player.x, 
            Config.Start.Player.y, 
            me._controls,
            gunLogic);

        me._toUpdate = [];

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

        for (let i = 0; i < Consts.CollideTiles.length; ++i) {
            const tileIndex = Consts.CollideTiles[i];
            me._level.setCollision(tileIndex);
        }

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
            const square = new Enemy(scene, enemyGroup, pos.x, pos.y, new EnemyBehaviour());
            me._toUpdate.push(square);
        }

        scene.physics.add.collider(
            enemyGroup, 
            enemyGroup,
            (first, second) => {
                first.owner.stopAccelerate();
                second.owner.stopAccelerate();
            });

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

        scene.physics.add.collider(
            enemyGroup, 
            containerGroup,
            (e, c) => {
                if (c.owner.isFree()) {
                    e.owner.backToPool();
                    c.owner.catch();
                } else {
                    e.owner.stopAccelerate();
                    c.owner.stopAccelerate();
                }
            });

        scene.physics.add.collider(
            me._player.toGameObject(),
            tiles
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
        )

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = scene.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });
    }

    update(delta) {
        const me = this;
        
        me._controls.update();

        me._player.update();

        for (let i = 0; i < me._toUpdate.length; ++i)
            me._toUpdate[i].update(delta);

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            let text =
                `mse: ${me._scene.input.activePointer.worldX | 0} ${me._scene.input.activePointer.worldY | 0}\n` +
                `plr: ${me._player.toGameObject().x | 0} ${me._player.toGameObject().y | 0}`;

            me._log.setText(text);
        });
    }
}