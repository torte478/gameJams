import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Helper from './Helper.js';
import Board from './Impl/Board.js';
import Utils from './Utils.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;

        // Phaser

        scene.cameras.main.setScroll(-224, -96);

        // My

        const board = new Board(scene, 8); // TODO

        // Debug

        if (Utils.isDebug(Config.Debug.TraceLog)) {
            me._log = scene.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setDepth(Consts.Depth.Max)
                .setScrollFactor(0);
        }
    }

    update() {
        const me = this;

        me._updateDebugLog();
    }

    _updateDebugLog() {
        const me = this;

        if (!Utils.isDebug(Config.Debug.TraceLog))
            return;

        let text = 
            `mse: ${me._scene.input.activePointer.worldX} ${me._scene.input.activePointer.worldY}`;

        me._log.setText(text);
    }
}