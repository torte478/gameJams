import Phaser from '../lib/phaser.js';

import Audio from './utils/Audio.js';
import Utils from './utils/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Gun from './Gun.js';
import Movable from './Movable.js';
import Enemy from './Enemy.js';
import Container from './Container.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Audio} */
    _audio;

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Gun} */
    _gun;

    /** @type {Object[]} */
    _toUpdate;

    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;
        me._audio = new Audio(scene);
        me._gun = new Gun(scene);

        scene.cameras.main.setRoundPixels(true);

        me._toUpdate = [];

        me._level = scene.make.tilemap({
            key: 'level',
            tileWidth: Consts.Unit,
            tileHeight: Consts.Unit
        });
        const tileset = me._level.addTilesetImage('tilemap');
        const tiles = me._level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Tiles);

        for (let i = 0; i < Consts.CollideTiles.length; ++i) {
            const tileIndex = Consts.CollideTiles[i];
            me._level.setCollision(tileIndex);
        }

        const enemyGroup = new Phaser.Physics.Arcade.Group(scene.physics.world, scene);
        const containerGroup = new Phaser.Physics.Arcade.Group(scene.physics.world, scene);

        const firstEnemy = new Enemy(scene, enemyGroup, 230, 600);
        const secondEnemy = new Enemy(scene, enemyGroup, 755, 700);

        const container = new Container(scene, containerGroup, 740, 400);

        me._toUpdate.push(firstEnemy);
        me._toUpdate.push(secondEnemy);
        me._toUpdate.push(container);

        scene.physics.add.collider(
            enemyGroup, 
            enemyGroup,
            (first, second) => {
                first.owner.stopAccelerate();
                second.owner.stopAccelerate();
            });

        scene.physics.add.collider(
            enemyGroup,
            tiles,
            (m, t) => {
                m.owner.stopAccelerate();
            }
        );

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

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = scene.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });
    }

    update(delta) {
        const me = this;

        for (let i = 0; i < me._toUpdate.length; ++i)
            me._toUpdate[i].update(delta);

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            let text =
                `mse: ${me._scene.input.activePointer.worldX | 0} ${me._scene.input.activePointer.worldY | 0}`;

            me._log.setText(text);
        });
    }
}