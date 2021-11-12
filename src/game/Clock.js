import Phaser from "../lib/phaser.js";

import {Rectangle, Geometry } from "./Geometry.js";

class Segment {
    /** @type {Phaser.GameObjects.Image} */
    image;

    /** @type {Rectangle} */
    rectangle;

    /**
     * @param {Phaser.GameObjects.Image} image 
     * @param {Phaser.Math.Vector2} center 
     * @param {Number} size
     */
    constructor(image, center, size) {
        const me = this;

        me.image = image;
        me.rectangle = Rectangle.build(
            new Phaser.Math.Vector2(-center.x, -center.y),
            new Phaser.Math.Vector2(-center.x + size, -center.y + size)
        );
    }

    /**
     * @param @type {Number} angle
     * @returns @type {Rectangle}
     */
    rotate(angle) {
        const me = this;

        return new Rectangle(
            me.rotatePoint(me.rectangle.a, angle),
            me.rotatePoint(me.rectangle.b, angle),
            me.rotatePoint(me.rectangle.c, angle),
            me.rotatePoint(me.rectangle.d, angle));
    }

    rotatePoint(p, angle) {
        const point = Phaser.Math.Rotate(new Phaser.Geom.Point(p.x, p.y), Phaser.Math.DegToRad(angle));
        return new Phaser.Math.Vector2(Math.round(point.x), Math.round(point.y));
    }
}

export default class Clock {

    /** @type {Array} */
    background;

    /** @type {Number} */
    count;

    /** @type {Number} */
    size;

    /**
     * @param {Phaser.Scene} scene
     * @param {Number} count
     * @param {Number} size
     */
    constructor(scene, count, size) {
        const me = this;

        me.count = count;
        me.size = size;

        me.background = [];
        for (let i = 0; i < count; ++i) 
        for (let j = 0; j < count; ++j) {
            const origin = new Phaser.Math.Vector2(
                size * (count / 2 - j),
                size * (count / 2 - i));

            const image = scene.add.image(0, 0, `background_${i}_${j}`)
                .setDisplayOrigin(origin.x, origin.y)
                .setVisible(false);

            me.background.push(new Segment(
                image,
                origin,
                size));
        }
    }

    /**
     * @param {Number} time 
     * @param {Rectangle} camera;
     */
    update(time, camera) {
        const me = this;

        const angle = -6 * time;

        me.background.forEach((value) => {

            /** @type {Segment} */
            const segment = value;

            // TODO: combine rotation methods
            segment.image.angle = angle;

            const visible = Geometry.isRectanglesIntersects(segment.rotate(angle), camera);
            segment.image.setVisible(visible);
        });
    }
}