import Phaser from "../lib/phaser.js";

import { Rectangle } from "./Geometry.js";
import Segment from "./Segment.js";

export default class Clock {

    /** @type {Phaser.Scene} */
    scene;

    /** @type {Array} */
    segments;

    /**
     * @param {Phaser.Scene} scene
     * @param {Number} count
     * @param {Number} size
     */
    constructor(scene) {
        const me = this;

        me.scene = scene;
        me.segments = [];
    }

    addTiles(count, size, format) {
        const me = this;

        for (let i = 0; i < count; ++i) 
        for (let j = 0; j < count; ++j) {
            const origin = new Phaser.Geom.Point(
                size * (count / 2 - j),
                size * (count / 2 - i));

            const image = me.scene.add.image(
                    0, 
                    0, 
                    `${format}_${i}_${j}`)
                .setDisplayOrigin(origin.x, origin.y)
                .setVisible(false);

            me.segments.push(new Segment(
                image,
                origin,
                size));
        }

        return me;
    }

    /**
     * @param {Number} time 
     * @param {Rectangle} camera;
     */
    update(time, camera) {
        const me = this;

        const angle = -6 * time;

        me.segments.forEach((value) => {

            /** @type {Segment} */
            const segment = value;

            segment.rotate(camera, angle);
        });
    }
}