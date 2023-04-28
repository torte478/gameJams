import Phaser from '../lib/phaser.js';

import Here from './Here.js';

export default class HereScene extends Phaser.Scene {

    /**
     * @param {String} sceneName
     */
    constructor(sceneName) {
        super(sceneName);
        Here.init(this);
    }
}
