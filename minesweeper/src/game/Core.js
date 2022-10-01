import Phaser from '../lib/phaser.js';

import Audio from './utils/Audio.js';
import Button from './utils/Button.js';
import ButtonConfig from './utils/ButtonConfig.js';
import Utils from './utils/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Minesweeper from './minesweeper/Minesweeper.js';
import Status from './Status.js';
import Graphics from './Graphics.js';
import City from './city/City.js';
import Reserve from './Reserve.js';

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

    /** @type {City} */
    _city;

    /** @type {Reserve} */
    _reserve;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;
        me._audio = new Audio(scene);

        me._status = new Status(Config.StartLevelIndex); // TODO
        me._reserve = new Reserve(
            scene, 
            Consts.Viewport.Width - Consts.Unit, 
            Consts.Viewport.Height - Consts.Unit,
            Config.Levels[me._status.level].ReserveStartCount,
            Consts.ReserveMaxSize);

        const graphics = new Graphics(scene);
        me._minesweeper = new Minesweeper(scene, me._status, graphics, me._reserve);

        me._city = new City(scene, me._status, me._reserve);

        if (Config.Levels[me._status.level].StartInCity) {
            me._city.spawnCitizens();
            scene.cameras.main.setScroll(
                -Consts.Viewport.Width, 0);
        }

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

    onKeyDown(event) {
        const me = this;

        Utils.ifDebug(Config.Debug.Restart, () => {
            if (event.repeat || event.key != 'r') 
                return;
            
            console.clear();
            me._scene.scene.start('game');
        })
    }
}