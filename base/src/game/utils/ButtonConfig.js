import Phaser from '../../lib/phaser.js';

export default class ButtonConfig {

    /** @type {Number} */
    x;

    /** @type {Number} */
    y;

    /** @type {String} */
    texture;

    /** @type {Number} */
    frameIdle;

    /** @type {Number} */
    frameSelected;

    /** @type {Function} */
    callback;

    /** @type {Object} */
    callbackScope;

    /** @type {String} */
    text;

    /** @type {Phaser.GameObjects.TextStyle} */
    textStyle;

    /** @type {string} */
    sound;
}