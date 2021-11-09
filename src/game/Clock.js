import Phaser from "../lib/phaser.js";

export default class Clock {

    /** @type {Array} */
    background;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        const size = 8000; // TODO

        me.background = [];
        for (let i = 0; i < 4; ++i) 
        for (let j = 0; j < 4; ++j) {
            me.background.push(
                scene.add.image(
                    0,
                    0,
                    `background_${i}_${j}`)
                    .setDisplayOrigin(
                        size * (2 - j),
                        size * (2 - i))
                    .setVisible(i == 1 && j == 1 || i ==1 && j == 2));
        }
    }

    /**
     * @param {Number} time 
     */
    update(time) {
        const me = this;

        const angle = -6 * time;

        me.background.forEach((value) => {

            /** @type {Phaser.GameObjects.Image} */
            const image = value;
            image.angle = angle;
        });
    }
}