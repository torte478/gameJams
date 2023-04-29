import Here from '../framework/Here.js';
import Phaser from '../lib/phaser.js';
import { ContainerOffset, SinCoeffs } from './Models.js';
import Player from './Player.js';

export default class PlayerContainer {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {SinCoeffs} */
    _sinXCoefs;

    /** @type {SinCoeffs} */
    _sinYCoefs;

    /** @type {SinCoeffs} */
    _sinAngleCoefs;

    /**
     * @param {Player} player 
     */
    constructor(player) {
        const me = this;

        me._container = Here._.add.container(0, 0, [
            Here._.add.image(-75, 125, 'ship_back'),
            player.getGameObject(),
            Here._.add.image(10, 325, 'ship_front')
        ]);

        me._sinYCoefs = {
            min: 0,
            max: 200,
            a: 1,
            b: 1.66,
            amplitude: 1,
            start: 0
        };

        me._sinXCoefs = {
            min: -100,
            max: 100,
            a: 1,
            b: 1.33,
            amplitude: 1,
            start: 123
        };

        me._sinAngleCoefs = {
            min: -30,
            max: 30,
            a: 1,
            b: 1.72,
            amplitude: 1,
            start: 321
        };
    }

    update(time) {
        const me = this;

        const newX = me._magicMath(time, me._sinXCoefs);
        const newY = me._magicMath(time, me._sinYCoefs);
        const newAngle = me._magicMath(time, me._sinAngleCoefs);

        me._container
            .setPosition(newX, newY)
            .setAngle(newAngle);
    }

    /**
     * @returns {ContainerOffset}
     */
    getOffset() {
        const me = this;

        return {
            x: me._container.x,
            y: me._container.y,
            angle: me._container.angle
        };
    }

    /**
     * @param {Number} time
     * @param {SinCoeffs} coefs 
     */
    _magicMath(time, coefs) {
        const me = this;

        const currentT = time / 1000 * coefs.amplitude + coefs.start;
        const sinValue = 0.5 * Math.sin(coefs.a * currentT) + 0.5 * Math.sin(coefs.b * currentT);

        return ((coefs.max - coefs.min) / 2) * (sinValue + 1) + coefs.min;
    }
}