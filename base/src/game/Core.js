import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Helper from './Helper.js';
import Utils from './Utils.js';

export default class Core {

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        Utils.debugLog('Hello, world!');
    }

    update() {
        const me = this;
    }
}