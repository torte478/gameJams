import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Movable from './Movable.js';
import Utils from './utils/Utils.js';

export default class Container extends Movable {

    /** @type {Boolean} */
    _isFree;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Physics.Arcade.Group} group
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, group, x, y) {
        /** @type {Phaser.Physics.Arcade.Sprite} */
        const sprite = group.create(x, y, 'big', 1);

        sprite
            .setCircle(Consts.Unit)
            .setCollideWorldBounds(true)
            .setBounce(0.5)

        super(scene, group, sprite);

        const me = this;
        me._isFree = true;
    }

    catch() {
        const me = this;

        if (!me._isFree)
            throw 'container is not free';

        me.stopAccelerate();
        me._bodyContainer.setFrame(2);
        me._isFree = false;
    }

    isFree() {
        const me = this;

        return me._isFree;
    }
}