import Phaser from '../lib/phaser.js';

import Audio from './utils/Audio.js';
import Button from './utils/Button.js';
import ButtonConfig from './utils/ButtonConfig.js';
import Utils from './utils/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Minesweeper from './Minesweeper.js';
import Status from './Status.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Audio} */
    _audio;

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Minesweeper} */
    _minesweeper;

    /** @type {Status} */
    _status;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;
        me._audio = new Audio(scene);

        me._status = new Status(Config.StartLevelIndex); // TODO
        me._minesweeper = new Minesweeper(scene, me._status);

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = scene.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });
    }

    update() {
        const me = this;

        const pointer = Utils.buildPoint(
            me._scene.input.activePointer.worldX,
            me._scene.input.activePointer.worldY);

        me._minesweeper.update(pointer);

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            let text = 
                `mse: ${pointer.x} ${pointer.y}`;

            me._log.setText(text);
        });
    }
}