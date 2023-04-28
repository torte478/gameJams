import Phaser from '../../lib/phaser.js';
import Audio from './Audio.js';

export default class Here {

    /** @type {Phaser.Scene} */
    static _;

    /** @type {Audio} */
    static Audio;

    static init(scene) {
        const me = this;

        me._ = scene;
        me.Audio = new Audio();
    }
}
