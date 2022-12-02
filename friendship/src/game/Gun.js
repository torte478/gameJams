import Phaser from '../lib/phaser.js';

export default class Gun {

    /** @type {Number} */
    _shots;

    /** @type {Phaser.GameObjects.Sprite} */
    _first;

    /** @type {Phaser.GameObjects.Sprite} */
    _second;

    /**
     * 
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._shots = 0;

        me._first = scene.add.sprite(0, 0, 'shot_sphere')
            .setVisible(false);

        me._second = scene.add.sprite(0, 0, 'shot_sphere')
            .setVisible(false);

        scene.input.on('pointerdown', (pointer) => me._shot(pointer.x, pointer.y), me);
    }

    _shot(x, y) {
        const me = this;

        me._shots += 1;

        if (me._shots === 1) {
            me._first
                .setPosition(x, y)
                .setVisible(true);
        } else if (me._shots === 2) {
            me._second
                .setPosition(x, y)
                .setVisible(true);
        }
        else {
            me._first.setVisible(false);
            me._second.setVisible(false);
            me._shots = 0;
        }
    }
}