import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Utils from './Utils.js';

export default class Sound {

    /** @type {Phaser.Sound.HTML5AudioSoundManager} */
    _sound;

    /** @type {Number} */
    _layer;

    constructor(sound, layer) {
        const me = this;

        me._sound = sound;
        me._layer = layer;
    }

    tryPlay(name, layer) {
        const me = this;

        if (layer != me._layer) 
            return;

        me._sound.play(name);
    }

    tryPlaySingleton(name, layer) {
        const me = this;

        if (layer != me._layer) 
            return;

        me._sound.stopByKey(name);
        me._sound.play(name);
    }

    play(name) {
        const me = this;

        me._sound.play(name);
    }

    setLayer(layer) {
        const me = this;

        me._layer = layer;
    }
}