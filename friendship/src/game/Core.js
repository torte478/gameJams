import Phaser from '../lib/phaser.js';

import Audio from './utils/Audio.js';
import Utils from './utils/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Gun from './Gun.js';
import Movable from './Movable.js';

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

        const movableGroup = new Phaser.Physics.Arcade.Group(scene.physics.world, scene);

        const firstObj = new Movable(scene, movableGroup, 230, 600);
        const secondObj = new Movable(scene, movableGroup, 755, 700);

        me._toUpdate.push(firstObj);
        me._toUpdate.push(secondObj);

        scene.physics.add.collider(movableGroup, movableGroup,
            // firstObj.toGameObject(),
            // secondObj.toGameObject(),
            (first, second) => {
                first.owner.stopAccelerate();
                second.owner.stopAccelerate();
            });

        scene.physics.add.collider(
            movableGroup,
            tiles,
            (first, second) => {
                if (!!first.owner)
                    first.owner.stopAccelerate();
                if (!!second.owner)
                    second.owner.stopAccelerate();
            }
        );

        scene.physics.add.collider(
            secondObj.toGameObject(),
            tiles,
            (first, second) => {
                if (!!first.owner)
                    first.owner.stopAccelerate();
                if (!!second.owner)
                    second.owner.stopAccelerate();
            }
        );

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