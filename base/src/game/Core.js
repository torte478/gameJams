import Phaser from '../lib/phaser.js';

import Audio from './utils/Audio.js';
import Button from './utils/Button.js';
import ButtonConfig from './utils/ButtonConfig.js';
import Utils from './utils/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Here from './utils/Here.js';

export default class Core {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    constructor() {
        const me = this;

        Utils.debugLog('PAST YOUR CODE HERE!');

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });
    }

    update() {
        const me = this;

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            const mouse = Here._.input.activePointer;

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}`;

            me._log.setText(text);
        });
    }
}