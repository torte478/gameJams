import Phaser from '../../lib/phaser.js';

export default class Soldier {
    
    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;

        me._sprite = scene.add.sprite(0, 0, 'soldiers', 0);
        me._container = scene.add.container(200, 200, [ me._sprite ]);
    }

    spawn(pos, callback, context) {
        const me = this;
    }
}