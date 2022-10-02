import Phaser from '../../lib/phaser.js';

import Utils from './Utils.js';
import Config from '../Config.js';

export default class Audio {

    /** @type {Phaser.Scene} */
    _scene;

    constructor(scene) {
        const me = this;

        me._scene = scene;
    }

    /**
     * @param {String} sound 
     * @param {Phaser.Types.Sound.SoundConfig} config
     */
    play(sound, config) {
        const me = this;

        Utils.ifDebug(Config.Debug.PlaySound, () => {
            me._scene.sound.play(sound, !!config ? config : null);
        });
    }
}