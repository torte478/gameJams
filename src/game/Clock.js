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

    /**
     * 
     * @param {Number} countX 
     * @param {Number} countY 
     * @param {Number} size 
     * @param {String} format 
     * @param {Number} depth 
     * @returns 
     */
    addTiles(countX, countY, size, format, depth) {
        const me = this;

        for (let i = 0; i < countY; ++i) 
        for (let j = 0; j < countX; ++j) {
            const origin = new Phaser.Geom.Point(
                countX > 1 ? size * (countX / 2 - j) : size / 2,
                countY > 1 ? size * (countY / 2 - i) : size / 2);

            const image = me.scene.add.image(
                    0, 
                    0, 
                    `${format}_${i}_${j}`)
                .setDisplayOrigin(origin.x, origin.y)
                .setDepth(depth)
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