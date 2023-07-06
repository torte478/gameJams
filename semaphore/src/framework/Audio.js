import Utils from './Utils.js';
import Here from './Here.js';
import Config from '../game/Config.js';

export default class Audio {

    /** @type {Set} */
    _playing;

    constructor() {
        const me = this;

        me._playing = new Set();
    }

    /**
     * @param {String} sound 
     * @param {Phaser.Types.Sound.SoundConfig} config
     */
    play(sound, config) {
        const me = this;

        Here._.sound.play(sound, config ? config : null);
    }

    /**
     * @param {String} sound 
     * @param {Phaser.Types.Sound.SoundConfig} config 
     */
    playIfNotPlaying(sound, config) {
        const me = this;

        if (me._playing.has(sound))
            return;

        me._playing.add(sound);
        me.play(sound, config);
    }

    /**
     * @param {String} sound 
     */
    stop(sound) {
        const me = this;

        Here._.sound.stopByKey(sound);

        if (me._playing.has(sound))
            me._playing.delete(sound);
    }

    /**
     */
    stopAll() {
        const me = this;

        Here._.sound.stopAll();
        me._playing.clear();
    }
}