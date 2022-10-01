import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
import Utils from '../utils/Utils.js';

export default class Citizen {
    
    _scene;
    _sprite;
    _shadow;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    _timeline;

    /**
     * @param {Phaser.Scene} scene
     * @param {Phaser.GameObjects.Group} pool 
     * @param {Phaser.Geom.Point} pos 
     * @param {Number} skin 
     */
    constructor(scene, pool, pos, skin, level) {
        const me = this;

        me._scene = scene;
        me._sprite = pool.create(0, 0, 'citizens', skin * Consts.Citizen.SkinLength);
        me._shadow = pool.create(0, Consts.Shadow.Offset, 'items', Consts.Shadow.Middle);

        me._container = scene.add.container(pos.x, pos.y, [ me._shadow, me._sprite ])
            .setDepth(Consts.Depth.CitizenBottom - (Consts.Citizen.DownY - pos.y));

        scene.physics.world.enable(me._container);

        const direction = Utils.getRandom(0, 1) == 0 ? 1 : -1;
        const velocity = Utils.getRandom(
            Config.Levels[level].MinCitizenSpeed, 
            Config.Levels[level].MaxCitizenSpeed);

        me._container.body
            .setBounce(1, 0)
            .setCollideWorldBounds(true)
            .setVelocity(velocity * direction, 0)
    }
    
    /**
     * @param {Phaser.GameObjects.Group} pool 
     */
    dispose(pool) {
        const me = this;

        pool.killAndHide(me._sprite);
        pool.killAndHide(me._shadow);

        me._scene.physics.world.disable(me._container);
        me._container.destroy();
    }
}