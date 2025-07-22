import Phaser from '../lib/phaser.js';
import Audio from './Audio.js';
import Controls from './Controls.js';

export default class Here {

    /** @type {Phaser.Scene} */
    static _;

    /** @type {Audio} */
    static Audio;

    /** @type {Controls} */
    static Controls;

    static init(scene) {
        const me = this;

        me._ = scene;
        me.Audio = new Audio();
        me.Controls = new Controls(scene);
    }
}
