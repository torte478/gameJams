import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';
import Utils from './utils/Utils.js';

export default class Graphics {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Group} */
    _pool;

    constructor(scene) {
        const me = this;

        me._scene = scene;
        me._pool = scene.add.group();
    }

    createExplosion(pos) {
        const me = this;

        /** @type {Phaser.GameObjects.Sprite} */
        const explosion = me._pool.create(pos.x, pos.y, 'explosions')
            .setDepth(Consts.Depth.Explosion);
        explosion.play('mine_explosion');

        me._scene.time.delayedCall(
            1000,
            () => {
                me._pool.killAndHide(explosion);
            });
    }

    createSmoke(pos) {
        const me = this;

        /** @type {Phaser.GameObjects.Sprite} */
        const smoke = me._pool.create(pos.x, pos.y, 'items')
            .setDepth(Consts.Depth.Smoke);
        smoke.play('mine_smoke');

        return smoke;
    }

    createBigSpot(pos) {
        const me = this;

        /** @type {Phaser.GameObjects.Sprite} */
        const bigSpot = me._pool.create(pos.x, pos.y + 12, 'explosions', Utils.getRandom(13, 15))
            .setDepth(Consts.Depth.Ground);
        
        bigSpot.setAngle(Utils.getRandom(0, 360));
    }

    createBloodSpot(pos, corpseDepth) {
        const me = this;

        
    
        const spot = me._pool.create(pos.x, pos.y + 12, 'items', 12)
            .setDepth(Consts.Depth.Ground);
    }

    createShot(pos) {
        const me = this;

        return me._pool.create(pos.x, pos.y, 'explosions', 12);
    }

    createCoffin(pos) {
        const me = this;

        return me._pool.create(pos.x, pos.y, 'items', 16);
    }

    createGrave(pos) {
        const me = this;

        return me._pool.create(pos.x + Utils.getRandom(-5, 5), pos.y + Utils.getRandom(-5, 5), 'items', Utils.getRandom(20, 24));
    }

    killAndHide(obj) {
        const me = this;

        me._pool.killAndHide(obj);
    }
}