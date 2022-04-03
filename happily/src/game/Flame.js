import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Button {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Phaser.Geom.Rectangle} */
    _rect;

    /** @type {Boolean} */
    _active;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} angle
     * @param {Phaser.GameObjects.Particles.ParticleEmitterManager} particles
     */
    constructor(scene, x, y, angle, particles) {
        const me = this;

        me._sprite = scene.add.sprite(x, y, 'items', 10)
            .setAngle(angle)
            .play('flame_turret');

        me._active = true;

        const accY = angle == 90 || angle == 270
            ? (angle == 90 ? 1 : -1)
            : 0;

        const accX = angle == 0 || angle == 180
            ? (angle == 0 ? 1 : -1)
            : 0;

        me._emmiter = particles.createEmitter({
            alpha: { start: 1, end: 0 },
            scale: { start: 0.5, end: 2.5},
            speed: 40,
            accelerationY: 300 * accY,
            accelerationX: 300 * accX,
            angle: { min: -85, max: -95 },
            rotate: { min: -45, max: 45 },
            lifespan: { min: 1000, max: 1000 },
            frequency: 110,
            x: x,
            y: y
        });

        const shift = 175;
        if (accY != 0)
            me._rect = new Phaser.Geom.Rectangle(x - 35, y + shift * accY, 70, 150);
        else {
            const temp = accX < 0 ? shift * accX : 25;
            me._rect = new Phaser.Geom.Rectangle(x + temp, y - 35, 150, 70);
        }

        //scene.add.graphics().fillStyle(0xffff00, 1).fillRect(me._rect.x, me._rect.y, me._rect.width, me._rect.height);
    }

    checkDamage(pos) {
        const me = this;

        return me._active && Phaser.Geom.Rectangle.ContainsPoint(me._rect, pos);
    }

    checkDestroy(pos) {
        const me = this;

        if (!me._active)
            return;

        const destroyed = Math.abs(pos.x - me._sprite.x) < 200
                          && Math.abs(pos.y - me._sprite.y) < 75;
        if (!destroyed)
            return;

        me._active = false;
        me._sprite.stop();
        me._sprite.setFrame(13);
        me._emmiter.stop();
    }
}