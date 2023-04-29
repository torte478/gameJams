import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Player from './Player.js';
import Delivery from './Delivery.js';

export default class Game {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Player} */
    _player;

    /** @type {Delivery} */
    _delivery;

    constructor() {
        const me = this;

        Here._.cameras.main.setScroll(
            Consts.Viewport.Width / -2,
            Consts.Viewport.Height / -2
        );

        Here._.input.mouse.disableContextMenu();

        me._player = new Player();
        me._delivery = new Delivery('grtew');

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(10, 10, '', { fontSize: 28, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });
    }

    update() {
        const me = this;

        if (Here.Controls.isPressed(Enums.Keyboard.RESTART) 
            && Utils.isDebug(Config.Debug.Global))
            Here._.scene.restart({ isRestart: true });

        me._gameLoop();

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            const mouse = Here._.input.activePointer;

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` + 
                `inp: ${me._delivery._word} => ${me._delivery._currentLetter}\n` +
                `cur: ${me._delivery._currentWord}\n` + 
                `num: ${me._delivery._isNumerals}`;

            me._log.setText(text);
        });
    }

    _gameLoop() {
        const me = this;

        me._player.update();

        if (Here.Controls.isPressed(Enums.Keyboard.MAIN_ACTION))
            me._processSignalInput();
    }

    _processSignalInput() {
        const me = this;

        const signal = me._player.getSignal();
        me._delivery.applySignal(signal);
    }
}