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

        if (Utils.isDebug(Config.Debug.MuteSound))
            return;

        me._scene.sound.play(sound,  !!config ? config : null);
    }

    stop(key) {
        const me = this;

        me._scene.sound.stopByKey(key);
    }
}