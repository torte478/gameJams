import Phaser from "../lib/phaser.js";

import { Rectangle } from "./Geometry.js";
import Segment from "./Segment.js";

export default class Clock {

    /** @type {Phaser.Scene} */
    scene;

    /** @type {Array} */
    segments;
    
    /** @type {Phaser.GameObjects.Group} */
    spritePool;

    /** @type {Array} */
    sprites;

    /**
     * @param {Phaser.Scene} scene
     * @param {Number} count
     * @param {Number} size
     */
    constructor(scene) {
        const me = this;

        me.scene = scene;
        me.segments = [];
        me.spritePool = scene.add.group();
        me.sprites = [];
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

            me.segments.push(new Segment(
                `${format}_${i}_${j}`,
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

            const visible = segment.rotate(camera, angle);
            const active = !!segment.view;

            if (visible && !active){

                /** @type {Phaser.GameObjects.Sprite} */
                const image = me.spritePool.get(0 , 0, segment.imageName);
                image
                    .setTexture(segment.imageName)
                    .setDisplayOrigin(segment.origin.x, segment.origin.y)
                    .setDepth(-1000) //TODO : to consts
                    .setActive(true)
                    .setVisible(true);
                    
                me.sprites.push(image);
                segment.view = image;
            } 
            else if (!visible && active) {
                me.spritePool.killAndHide(segment.view);
                segment.view = null;
            }
        });

        me.sprites.forEach((item) => {

            /** @type {Phaser.GameObjects.Sprite} */
            const sprite = item;
            sprite.angle = angle;
        })
    }
}