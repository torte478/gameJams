import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Player from './Player.js';
import Delivery from './Delivery.js';
import Waves from './Waves.js';

export default class Game {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Player} */
    _player;

    /** @type {Delivery} */
    _delivery;

    constructor() {
        const me = this;

        Here._.cameras.main
            .setScroll(
                Consts.Viewport.Width / -2,
                Consts.Viewport.Height / -2)
            .setBackgroundColor('#158CD6');

        Here._.input.mouse.disableContextMenu();

        const waves = new Waves();
        const shipBack = Here._.add.image(-75, 125, 'ship_back');
        me._player = new Player();
        me._delivery = new Delivery('grtew');
        const shipFront = Here._.add.image(10, 325, 'ship_front');

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(10, 10, '', { fontSize: 28, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });
    }

    update(delta) {
        const me = this;

        if (Here.Controls.isPressed(Enums.Keyboard.RESTART) 
            && Utils.isDebug(Config.Debug.Global))
            Here._.scene.restart({ isRestart: true });

        me._gameLoop(delta);

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            const mouse = Here._.input.activePointer;

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` + 
                `inp: ${me._delivery._word} => ${me._delivery._currentLetter}\n` +
                `cur: ${me._delivery._currentWord}\n` + 
                `lft: ${me._player._leftHand._sprite.angle | 0}\n` + 
                `rgt: ${me._player._rightHand._sprite.angle | 0}\n`;

            me._log.setText(text);
        });
    }

    _gameLoop(delta) {
        const me = this;

        me._player.update(delta);

        if (Here.Controls.isPressed(Enums.Keyboard.MAIN_ACTION))
            me._processSignalInput();
    }

    _processSignalInput() {
        const me = this;

        const signal = me._player.getSignal();
        me._delivery.applySignal(signal);
    }
}