import Phaser from '../lib/phaser.js';

export default class Player {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y) {
        const me = this

        me._sprite = scene.add.sprite(0, 0, 'player', 0);

        me._container = scene.add.container(x, y, [ me._sprite ]);
    }

    toCollider() {
        const me = this;

        return me._container;
    }
}
