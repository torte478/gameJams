import Phaser from "../lib/phaser.js";

import {Rectangle, Geometry } from "./Geometry.js";

export default class Segment {
    /** @type {Phaser.GameObjects.Image} */
    image;

    /** @type {Rectangle} */
    rectangle;

    /**
     * @param {Phaser.GameObjects.Image} image 
     * @param {Phaser.Geom.Point} center 
     * @param {Number} size
     */
    constructor(image, center, size) {
        const me = this;

        me.image = image;
        me.rectangle = Rectangle.build(
            new Phaser.Geom.Point(-center.x, -center.y),
            new Phaser.Geom.Point(-center.x + size, -center.y + size)
        );
    }

    /**
     * @param {Rectangle} camera
     * @param {Number} angle
     */
    rotate(camera, angle) {
        const me = this;

        me.image.angle = angle;
        const rotation = Phaser.Math.DegToRad(angle);

        const coords = new Rectangle(
            me.rotatePoint(me.rectangle.a, rotation),
            me.rotatePoint(me.rectangle.b, rotation),
            me.rotatePoint(me.rectangle.c, rotation),
            me.rotatePoint(me.rectangle.d, rotation));

        const visible = Geometry.isRectanglesIntersects(coords, camera);
        me.image.setVisible(visible);
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Number} angle 
     * @returns {Phaser.Geom.Point}
     */
    rotatePoint(point, angle) {
        const res = new Phaser.Geom.Point(point.x, point.y);
        
        Phaser.Math.Rotate(res, angle);

        return new Phaser.Geom.Point(
            Math.round(res.x),
            Math.round(res.y)
        );
    }
}