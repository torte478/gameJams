import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';
import Helper from '../Helper.js';
import Utils from '../utils/Utils.js';

export default class Corpse {

    _sprite;
    _shadow;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    _idleFrame;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Geom.Point} pos 
     * @param {Phaser.GameObjects.Group} pool 
     * @param {Number} startFrame
     * @param {Number} idleFrame
     */
    constructor(scene, pos, pool, startFrame, idleFrame) {
        const me = this;

        me._idleFrame = idleFrame;

        me._sprite = pool.create(0, 0, 'items', startFrame);
        me._shadow = pool.create(0, Consts.Shadow.Offset, 'items', Consts.Shadow.Big);

        me._container = scene.add.container(pos.x, pos.y, [ me._shadow, me._sprite ])
            .setDepth(Consts.Depth.Corpse);
    }

    toGameObject() {
        const me = this;

        return me._container;
    }

    toPoint() {
        const me = this;

        return Utils.toPoint(me._container);
    }

    idle() {
        const me = this;

        me._sprite.setFrame(me._idleFrame);
    }

    updateShadow(downY, upY) {
        const me = this;

        Helper.updateShadow(
            me._shadow,
            downY,
            me._container.y,
            upY,
            Consts.Shadow.Middle,
            Consts.Shadow.Big,
            Consts.Shadow.Offset
        );
    }

    getDepth() {
        const me = this;

        return me._container.depth;
    }

    dispose(pool) {
        const me = this;

        pool.killAndHide(me._sprite);
        pool.killAndHide(me._shadow);
        me._container.destroy();
    }

    hide() {
        const me = this;

        me._container.setVisible(false);
    }

    hideShadow() {
        const me = this;

        me._shadow.setVisible(false);
    }
}