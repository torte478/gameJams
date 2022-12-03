import Phaser from '../lib/phaser.js';
import Utils from './utils/Utils.js';

export default class EnemyCatcher {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.Geom.Rectangle} */
    _zone;

    /** @type {Phaser.Geom.Point} */
    _pos;

    /** @type {Number[]} */
    _stat;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Phaser.Geom.Rectangle} zone
     */
    constructor(scene, x, y, zone) {
        const me = this;

        me._scene = scene;
        me._zone = zone;
        me._pos = Utils.buildPoint(x, y);

        me._stat = [0, 0, 0];

        scene.add.image(x, y, 'enemy_catcher');

        // scene.add.rectangle(
        //     zone.x + (zone.width / 2), 
        //     zone.y + (zone.height / 2), 
        //     zone.width, 
        //     zone.height)
        //     .setStrokeStyle(2, 0xffff00);
    }

    update() {
        const me = this;

        const colliders = me._scene.physics.overlapRect(me._zone.x, me._zone.y, me._zone.width, me._zone.height, true)
            .filter(c => !!c.gameObject.isMovable 
                         && !c.gameObject.owner.isFree(0) 
                         && !c.gameObject.owner._isCatchedByCatcher);

        for (let i = 0; i < colliders.length; ++i) {
            /** @type {Phaser.Physics.Arcade.Body} */
            const body = colliders[i];
            const type = body.gameObject.owner.getType();
            body.gameObject.owner.startCatchByCatcher(me._pos.x, me._pos.y, () => me._onCatch(type), me);
        }
    }

    getStat() {
        const me = this;

        return me._stat;
    }

    _onCatch(type) {
        const me = this;

        me._stat[type] += 1;
    }
}