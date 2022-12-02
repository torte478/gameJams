import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Movable from './Movable.js';
import Utils from './utils/Utils.js';

export default class Enemy extends Movable {

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Physics.Arcade.Group} group
     * @param {Number} x 
     * @param {Number} y 
     */
     constructor(scene, group, x, y) {
        const sprite = group.create(x, y, 'main', 2)
            .setCollideWorldBounds(true)
            .setBounce(0.5)

        super(scene, group, sprite);

        const me = this;
     }
}