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
import ScreenTransfer from './ScreenTransfer.js';

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

        scene.cameras.main.setRoundPixels(true);

        me._scene = scene;
        me._audio = new Audio(scene);

        me._status = new Status(Config.StartLevelIndex); // TODO
        me._reserve = new Reserve(
            scene, 
            Consts.Viewport.Width - Consts.Unit, 
            Consts.Viewport.Height - Consts.Unit,
            Config.Levels[me._status.level].ReserveStartCount,
            Consts.ReserveMaxSize,
            me._status);

        me._screenTransfer = new ScreenTransfer(scene, me._status);
        me._screenTransfer.emmiter.on('transfer', me._onTransferClick, me);

        me._cityTheme = scene.sound.add('city_theme', { volume: 0.25, loop: true });
        me._mineTheme = scene.sound.add('mine_theme', { volume: 0.25, loop: true });

        const graphics = new Graphics(scene);
        me._minesweeper = new Minesweeper(scene, me._status, graphics, me._reserve, me._audio, me._mineTheme);

        me._city = new City(scene, me._status, me._reserve, graphics, me._audio);

        if (Config.Levels[me._status.level].StartInCity) {
            me._city.resume();
            scene.cameras.main.setScroll(
                -Consts.Viewport.Width, 0);
            me._reserve.shift(true);

            me._cityTheme.play();
        } else {
            me._mineTheme.play();
        }

        scene.input.mouse.disableContextMenu();

        if (!Utils.isDebug(Config.Debug.LevelName)) {
            me._status.busy();

            const levelText = `Level ${me._status.level + 1}/${Config.Levels.length}`;
            const levelTextObj = scene.add.text(
                    -Consts.Viewport.Width, 
                    Consts.Viewport.Height / 2, 
                    levelText, { 
                fontFamily: 'Arial Black',
                fontSize: 84,
                color: '#e3f0ff'})
                .setStroke('#6a7798', 16)
                .setShadow(2, 2, '#333333', 2)
                .setScrollFactor(0)
                .setOrigin(0.5, 0.5)
                .setDepth(Consts.Depth.Max);

            scene.tweens.timeline({
                targets: levelTextObj,
                tweens: [
                    {
                        x: Consts.Viewport.Width / 2,
                        ease: 'Sine.easeOut',
                        duration: 1000
                    },
                    {
                        x: Consts.Viewport.Width + Consts.Viewport.Width / 2,
                        ease: 'Sine.easeIn',
                        duration: 1000,
                        delay: 1000
                    }
                ],
                onComplete: () => {
                    levelTextObj.setVisible(false);
                    me._status.free();
                }
            });
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
                `mse: ${pointer.x} ${pointer.y}\n` +
                `ctz: ${me._status.avaialbeCitizens}\n` +
                `cty: ${me._status.isCity}`;

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

    _onTransferClick(toCity) {
        const me = this;

        if (toCity) {
            me._city.resume();
            me._mineTheme.stop();
        }
        else {
            me._cityTheme.stop();
            me._minesweeper.resume();
        }

        me._audio.play('action_start');

        me._scene.add.tween({
            targets: me._scene.cameras.main,
            scrollX: toCity ? -Consts.Viewport.Width : 0,
            duration: Consts.Speed.Camera,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (toCity) {
                    me._minesweeper.pause();
                    me._cityTheme.play();
                }
                else  {
                    me._city.pause();
                    me._mineTheme.play();
                }

                me._reserve.shift(me._status.isCity);
                me._screenTransfer.onTransferEnd();
                me._status.free();
            }
        })
    }
}