import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';
import { ContainerOffset, PlayerContainerPosition, SinCoeffs } from './Models.js';
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

    /** @type {Number} */
    _startTime;

    /** @type {Boolean} */
    _isCalculating;

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
        ])
            .setDepth(Consts.Depth.PLAYER_CONTAINER);

        me._isCalculating = false;
    }

    /**
     * @param {Number} levelIndex 
     * @param {SinCoeffs} sinXCoefs 
     * @param {SinCoeffs} sinYCoefs 
     * @param {SinCoeffs} sinAngleCoefs 
     * @returns {PlayerContainerPosition}
     */
    init(levelIndex, sinXCoefs, sinYCoefs, sinAngleCoefs) {
        const me = this;

        me._sinXCoefs = sinXCoefs;
        me._sinYCoefs = sinYCoefs;
        me._sinAngleCoefs = sinAngleCoefs;

        const isShipVisible = levelIndex > 0;
        me._shipBackSprite.setVisible(isShipVisible);
        me._shipFrontSprite.setVisible(isShipVisible);

        const position = me._getPositionAtTime(0);

        if (levelIndex == 0)
            return;

        me._isCalculating = false;

        Here._.add.tween({
            targets: me._container,
            x: position.x,
            y: position.y,
            angle: position.angle,
            duration: 1000,

            onComplete: () => {
                me._isCalculating = true;
                me._startTime = new Date().getTime();
            }
        });
    }

    update() {
        const me = this;

        if (!me._isCalculating)
            return;

        const position = me._getPositionAtTime(
            new Date().getTime() - me._startTime
        );

        me._container
            .setPosition(position.x, position.y)
            .setAngle(position.angle);
    }

    _getPositionAtTime(time) {
        const me = this;

        return {
            x: me._sinXCoefs.amplitude > 0 
                ? me._magicMath(time, me._sinXCoefs) 
                : me._container.x,

            y: me._sinYCoefs.amplitude > 0 
                ? me._magicMath(time, me._sinYCoefs)
                : me._container.y,

            angle: me._sinAngleCoefs.amplitude > 0 
                ? me._magicMath(time, me._sinAngleCoefs)
                : me._container.angle
        };
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