import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
import Utils from '../utils/Utils.js';

export default class Citizen {
    
    _scene;
    _sprite;

    _timeline;

    /**
     * @param {Phaser.Scene} scene
     * @param {Phaser.Physics.Arcade.Group} pool 
     * @param {Phaser.Geom.Point} pos 
     * @param {Number} skin 
     * @param {Function} clickCallback
     * @param {Object} scope
     */
    constructor(scene, pool, pos, skin, level, clickCallback, scope) {
        const me = this;

        me._scene = scene;

        const direction = Utils.getRandom(0, 1) == 0 ? 1 : -1;
        const velocity = Utils.getRandom(
            Config.Levels[level].MinCitizenSpeed, 
            Config.Levels[level].MaxCitizenSpeed);

        me._sprite = pool.create(pos.x, pos.y, 'citizens', skin * Consts.Citizen.SkinLength)
            .setInteractive()
            .setDepth(Consts.Depth.CitizenBottom - (Consts.Citizen.DownY - pos.y))
            .setBounce(1, 0)
            .setCollideWorldBounds(true)
            .setVelocity(velocity * direction, 0)
            .setFlipX(direction < 0);

        me._sprite.on('pointerdown', () => { clickCallback.call(scope, me) });
    }

    toGameObject() {
        const me = this;

        return me._sprite;
    }

    toPoint() {
        const me = this;

        return Utils.toPoint(me._sprite);
    }
    
    /**
     * @param {Phaser.GameObjects.Group} pool 
     */
    dispose(pool) {
        const me = this;

        pool.killAndHide(me._sprite);

        me._scene.physics.world.disable(me._sprite);
    }

    disableBody() {
        const me = this;

        me._scene.physics.world.disable(me._sprite);
    }
}