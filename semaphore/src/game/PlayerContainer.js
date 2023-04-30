import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
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

    /** @type {Phaser.GameObjects.Image} */
    _shipBackSprite;

    /** @type {Phaser.GameObjects.Image} */
    _shipFrontSprite;

    /**
     * @param {Player} player 
     */
    constructor(player) {
        const me = this;

        me._shipBackSprite = Here._.add.image(-75, 125, 'ship_back');
        me._shipFrontSprite = Here._.add.image(10, 325, 'ship_front');

        me._container = Here._.add.container(0, 0, [
            me._shipBackSprite,
            player.getGameObject(),
            me._shipFrontSprite
        ]);
    }

    init(levelIndex, sinXCoefs, sinYCoefs, sinAngleCoefs) {
        const me = this;

        me._sinXCoefs = sinXCoefs;
        me._sinYCoefs = sinYCoefs;
        me._sinAngleCoefs = sinAngleCoefs;

        const isShipVisible = levelIndex > 0;
        me._shipBackSprite.setVisible(isShipVisible);
        me._shipFrontSprite.setVisible(isShipVisible);
    }

    update(time) {
        const me = this;

        const newX = me._sinXCoefs.amplitude > 0 
            ? me._magicMath(time, me._sinXCoefs) 
            : me._container.x;

        const newY = me._sinYCoefs.amplitude > 0 
            ? me._magicMath(time, me._sinYCoefs)
            : me._container.y;

        const newAngle = me._sinAngleCoefs.amplitude > 0 
            ? me._magicMath(time, me._sinAngleCoefs)
            : me._container.angle;

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
     * @returns {Phaser.Geom.Point}
     */
    getPlayerPos() {
        const me = this;

        const origin = Utils.toPoint(me._container);
        return origin;
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