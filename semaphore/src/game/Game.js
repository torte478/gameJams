import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Player from './Player.js';
import Delivery from './Delivery.js';
import Waves from './Waves.js';
import PlayerContainer from './PlayerContainer.js';
import Tape from './Tape.js';
import Score from './Score.js';

export default class Game {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Number} */
    _state;

    /** @type {Player} */
    _player;

    /** @type {Delivery} */
    _delivery;

    /** @type {PlayerContainer} */
    _playerContainer;

    /** @type {Tape} */
    _tape;

    /** @type {Score} */
    _score;

    constructor() {
        const me = this;

        Here._.cameras.main
            .setScroll(
                Consts.Viewport.Width / -2,
                Consts.Viewport.Height / -2)
            .setBackgroundColor('#158CD6');

        Here._.input.mouse.disableContextMenu();

        const waves = new Waves();
        me._delivery = new Delivery('y');
        me._player = new Player();
        me._playerContainer = new PlayerContainer(me._player);

        me._tape = new Tape(me._delivery._current);
        me._score = new Score();

        me._state = Enums.GameState.GAME;

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(10, 10, '', { fontSize: 28, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });
    }

    update(time, delta) {
        const me = this;

        if (Here.Controls.isPressed(Enums.Keyboard.RESTART) 
            && Utils.isDebug(Config.Debug.Global))
            Here._.scene.restart({ isRestart: true });

        me._gameLoop(time, delta);
        me._score.updateGUI(me._state);

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            const mouse = Here._.input.activePointer;

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` + 
                `inp: ${me._delivery._word} => ${me._delivery._current}\n` +
                `cur: ${me._delivery._currentWord}\n` +
                `scr: ${me._score._scoreHistory}`;

            me._log.setText(text);
        });
    }

    _gameLoop(time, delta) {
        const me = this;

        const offset = me._playerContainer.getOffset();
        me._player.update(delta, offset, me._state);
        me._playerContainer.update(time);

        if (me._state == Enums.GameState.GAME)
            return me._onGameLoop(time, delta);
    }

    _onGameLoop() {
        const me = this;

        if (me._tape.isBusy())
            return;
            
        if (Here.Controls.isPressed(Enums.Keyboard.MAIN_ACTION)) {
            const signal = me._player.getSignal();    
            return me._processSignalInput(signal);
        }

        if (me._tape.checkTimeout())
            return me._processSignalInput('UNKNOWN');
    }

    _processSignalInput(signal) {
        const me = this;

        const playerPos = me._playerContainer.getPlayerPos();
        const result = me._delivery.applySignal(signal, playerPos);

        if (!result.currentChanged) 
            return;

        me._tape.processSignal(
            playerPos, 
            result, 
            () => me._score.processSignal(result), 
            () => me._onLevelComplete(),
            me);
    }

    _onLevelComplete() {
        const me = this;

        me._state = Enums.GameState.LEVEL_COMPLETED;
        me._score.startShowResult();
    }
}