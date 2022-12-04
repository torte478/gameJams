import Phaser from '../../lib/phaser.js';

import Utils from './Utils.js';
import Config from '../Config.js';

export default class Audio {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Set} */
    _set;

    constructor(scene) {
        const me = this;

        me._scene = scene;
        me._set = new Set();
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

    /**
     * @param {String} sound 
     * @param {Phaser.Types.Sound.SoundConfig} config
     */
    playSingleton(sound, config) {
        const me = this;

        if (Utils.isDebug(Config.Debug.MuteSound))
            return;

        if (me._set.has(sound))
            return;

        me._scene.sound.play(sound,  !!config ? config : null);
        me._set.add(sound);
    }

    stop(key) {
        const me = this;

        me._scene.sound.stopByKey(key);
        if (me._set.has(key))
            me._set.delete(key);
    }
}