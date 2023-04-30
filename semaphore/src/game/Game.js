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
import Rain from './Rain.js';
import Clipboard from './Clipboard.js';
import Seagull from './Seagull.js';
import MyGraphics from './MyGraphics.js';
import { LevelModel } from './Models.js';
import Button from '../framework/Button.js';

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

    /** @type {Rain} */
    _rain;

    /** @type {Clipboard} */
    _clipboard;

    /** @type {Seagull} */
    _seagull;

    /** @type {Number} */
    _currentLevelIndex;

    /** @type {LevelModel} */
    _currentLevelConfig;

    /** @type {Phaser.GameObjects.Container} */
    _mainMenuContainer;

    /** @type {Phaser.GameObjects.Image} */
    _tutorialBackground;

    /** @type {Phaser.GameObjects.Text} */
    _tutorialText;

    /** @type {Number} */
    _tutorialIndex;

    constructor() {
        const me = this;

        Here._.cameras.main
            .setScroll(
                Consts.Viewport.Width / -2,
                Consts.Viewport.Height / -2)
            .setBackgroundColor('#158CD6');

        Here._.input.mouse.disableContextMenu();

        me._currentLevelIndex = Config.Debug.Level;
        me._currentLevelConfig = Config.Levels[me._currentLevelIndex];

        const waves = new Waves();
        me._delivery = new Delivery('');
        me._player = new Player();
        me._playerContainer = new PlayerContainer(me._player);

        me._tape = new Tape(me._delivery._current);

        me._score = new Score(
            me._onRestartButtonClick,
            me._onNextButtonClick, // TODO
            me);

        me._rain = new Rain();
        me._clipboard = new Clipboard();

        me._seagull = new Seagull();
        // me._seagull.start();  

        new MyGraphics();

        me._state = Enums.GameState.GAME;
        me._mainMenuContainer = me._createMainMenuContainer();

        me._tutorialBackground = Here._.add.image(Consts.Viewport.Width, 0, 'tutorial')
            .setDepth(Consts.Depth.BACKGROUND);

        me._tutorialIndex = 0;
        me._tutorialText = Here._.add.text(-450, -300, '', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#e1d2d1',
            wordWrap: { width: 650, useAdvancedWrap: true }
        })
            .setOrigin(0, 0);

        me._startLevel();

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(10, 10, '', { fontSize: 28, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.MAX);
        });
    }

    update(time, delta) {
        const me = this;

        if (Here.Controls.isPressed(Enums.Keyboard.RESTART) 
            && Utils.isDebug(Config.Debug.Global))
            Here._.scene.restart({ isRestart: true });

        me._gameLoop(time, delta);
        me._score.updateGUI(me._state);
        me._rain.update();

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            const mouse = Here._.input.activePointer;

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` + 
                `que: ${me._tape._queue.size()}\n` +
                `trg: ${me._delivery._word}\n` +
                `cur: ${me._delivery._currentWord}`;

            me._log.setText(text);
        });
    }

    _startLevel(previousIndex) {
        const me = this;

        me._playerContainer.init(
            me._currentLevelIndex,
            me._currentLevelConfig.sinXCoefs,
            me._currentLevelConfig.sinYCoefs,
            me._currentLevelConfig.sinAngleCoefs);

        me._delivery.init(me._currentLevelConfig.message);

        me._score.init(me._currentLevelConfig.isMainMenu, me._currentLevelConfig.bonusTimeMs);
        me._tape.init(
            me._currentLevelConfig.isMainMenu,
            me._currentLevelConfig.message[0].toUpperCase(),
            me._currentLevelConfig.signalTimeout);

        me._clipboard.init(me._currentLevelConfig.isSeagullPoop);
        me._seagull.start(
            me._currentLevelConfig.isSeagullSmall,
            me._currentLevelConfig.isSeagullBig);

        if (previousIndex == 0)
            Here._.tweens.add({
                targets: me._mainMenuContainer,
                x: -Consts.Viewport.Width,
                duration: 1000,
                ease: 'sine.in'
            });

        if (!!me._currentLevelConfig.isTutorial)
            Here._.tweens.add({
                targets: me._tutorialBackground,
                x: 0,
                duration: 1000,
                ease: 'sine.in',
                onComplete: () => {
                    me._startTutorial()
                }
            });

        if (previousIndex == 1) {
            me._tutorialText.setText('');
            Here._.tweens.add({
                targets: me._tutorialBackground,
                x: -Consts.Viewport.Width,
                duration: 1000,
                ease: 'sine.in'
            });
        }

        me._state = Enums.GameState.GAME;
    }

    _gameLoop(time, delta) {
        const me = this;

        const offset = me._playerContainer.getOffset();
        me._player.update(delta, offset, me._state);
        me._playerContainer.update();

        if (me._state == Enums.GameState.GAME)
            return me._onGameLoop(time, delta);
    }

    _onGameLoop() {
        const me = this;

        if (Here.Controls.isPressed(Enums.Keyboard.SECOND_ACTION)) {
            me._clipboard.toggle();

            if (!!me._currentLevelConfig.isTutorial && me._tutorialIndex == 1) {
                me._tutorialIndex = 2;
                me._tutorialText.setText('use LMB and RMB to move flags\nuse SPACE to send signal below')
            }
        }
            
        if (!me._currentLevelConfig.isMainMenu 
            && !me._delivery.isComplete() 
            && Here.Controls.isPressed(Enums.Keyboard.MAIN_ACTION)) {

            const signal = me._player.getSignal();    
            me._processSignalInput(signal);
        }

        if (!me._currentLevelConfig.isMainMenu && me._tape.checkTimeout())
            me._processSignalInput('UNKNOWN');

        me._seagull.update(
            me._playerContainer.getPlayerPos(),
            () => me._player.attack(),
            me); 
    }

    _processSignalInput(signal) {
        const me = this;

        const playerPos = me._playerContainer.getPlayerPos();
        const result = me._delivery.applySignal(signal, playerPos);

        if (!result.currentChanged) 
            return;

        if (result.isLevelComplete && !!me._currentLevelConfig.isTutorial) {
            me._tutorialIndex = 7;
            me._tutorialText.setText('use the mouse in unexpected situations!!!');
        }

        if (result.to == '5' && !!me._currentLevelConfig.isTutorial && me._tutorialIndex == 5) {
            me._tutorialIndex = 6;
            me._tutorialText.setText('use "SWITCH" signal to switch to numbers and back')
        }

        if (result.to == '_' && !!me._currentLevelConfig.isTutorial && me._tutorialIndex == 4) {
            me._tutorialIndex = 5;
            me._tutorialText.setText('use can "CANCEL" signal to delete previous signals')
        }

        if (!!me._currentLevelConfig.isTutorial && me._tutorialIndex == 3) {
            me._tutorialIndex = 4;
            me._tutorialText.setText('')
        }

        if (result.to == '_' && !!me._currentLevelConfig.isTutorial && me._tutorialIndex == 2) {
            me._tutorialIndex = 3;
            me._tutorialText.setText('this is "space" signal. hands down =)')
        }

        me._tape.enqueueSignal(
            playerPos, 
            result, 
            () => me._score.processSignal(result), 
            () => me._onLevelComplete(),
            me);
    }

    _onLevelComplete() {
        const me = this;

        me._clipboard.hide();
        me._seagull.stop();
        me._state = Enums.GameState.LEVEL_COMPLETED;
        me._score.startShowResult(me._delivery.getMessage());
    }

    _onRestartButtonClick() { 
        const me = this;

        if (!!me._currentLevelConfig.isTutorial)
            me._startTutorial();

        me._score.stopShowResult(false, me._restart, me);
    }

    _onNextButtonClick() {
        const me = this;

        const previous = me._currentLevelIndex;
        me._currentLevelIndex = me._currentLevelIndex + 1;
        me._currentLevelConfig = Config.Levels[me._currentLevelIndex];

        me._score.stopShowResult(false, () => me._startLevel(previous), me);
    }

    _restart() {
        const me = this;

        me._delivery.reset();
        me._tape.reset(me._delivery._current.toUpperCase());

        me._seagull.start(
            me._currentLevelConfig.isSeagullSmall,
            me._currentLevelConfig.isSeagullBig);

        me._state = Enums.GameState.GAME;
    }

    _createMainMenuContainer() {
        const me = this;

        const background = Here._.add.image(0, 0, 'main_menu');

        const style = {
            fontFamily: 'Arial Black',
            fontSize: 64,
            color: '#d6d415'
        };

        const button1 = new Button({
            x: -250,
            y: -200,
            text: '1',
            textStyle: style,
            callback: () => me._selectLevel(1),
            callbackScope: me
        });

        const button2 = new Button({
            x: -300,
            y: 0,
            text: '2',
            textStyle: style,
            callback: () => me._selectLevel(2),
            callbackScope: me
        });

        const button3 = new Button({
            x: -250,
            y: 200,
            text: '3',
            textStyle: style,
            callback: () => me._selectLevel(3),
            callbackScope: me
        });

        const button4 = new Button({
            x: 250,
            y: -200,
            text: '4',
            textStyle: style,
            callback: () => me._selectLevel(4),
            callbackScope: me
        });

        const button5 = new Button({
            x: 300,
            y: 0,
            text: '5',
            textStyle: style,
            callback: () => me._selectLevel(5),
            callbackScope: me
        });

        const button6 = new Button({
            x: 250,
            y: 200,
            text: '6',
            textStyle: style,
            callback: () => me._selectLevel(6),
            callbackScope: me
        });

        const container = Here._.add.container(0, 0, [
            background,
            button1.getGameObject(),
            button2.getGameObject(),
            button3.getGameObject(),
            button4.getGameObject(),
            button5.getGameObject(),
            button6.getGameObject()
        ])
            .setDepth(Consts.Depth.BACKGROUND);

        return container;
    }

    _selectLevel(index) {
        const me = this;

        const previous = me._currentLevelIndex;
        me._currentLevelIndex = index;
        me._currentLevelConfig = Config.Levels[index];

        return me._startLevel(previous);
    }

    _startTutorial() {
        const me = this;

        me._tutorialText.setText('press TAB to show/hide clipboard');
        me._tutorialIndex = 1;
    }
}