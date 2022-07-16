import Phaser from '../lib/phaser.js';

import Board from './Impl/Board.js';
import Dice from './Impl/Dice.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Helper from './Helper.js';
import Utils from './Utils.js';
import Players from './Impl/Players.js';
import Context from './Impl/Context.js';
import AI from './Impl/AI.js';
import Carousel from './Impl/Carousel.js';
import Cell from './Impl/Cell.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Board} */
    _board;

    /** @type {Dice} */
    _dice;

    /** @type {Players} */
    _players;

    /** @type {Context} */
    _context;

    /** @type {AI[]} */
    _ai;

    /** @type {Carousel} */
    _carousel;

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} boardSize
     */
    constructor(scene, boardSize) {
        const me = this;

        me._scene = scene;

        // My

        me._context = new Context();
        me._board = new Board(scene, boardSize);
        me._dice = new Dice(scene, me._board.getBounds());
        me._carousel = new Carousel(scene);
        me._players = new Players(scene, me._board, me._context, me._carousel);

        me._ai = [ null ]
        for (let i = 1; i < 4; ++i) {
            const ai = new AI(i, me._context, me._players, me._board, Config.DebugWeight);
            me._ai.push(ai);
        }

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

    /**
     * @param {Phaser.Input.Pointer} pointer 
     */
    onPointerDown(pointer) {
        const me = this;

        const point = Utils.buildPoint(pointer.worldX, pointer.worldY);

        if (me._context.state === Enums.GameState.DICE_ROLL)
            me._dice.tryRoll(point, false, me._onDiceRoll, me);
        else if (me._context.state === Enums.GameState.MAKE_STEP)
            me._tryMakeStep(point);
    }

    /**
     * @param {KeyboardEvent} event 
     */
    onKeyDown(event) {
        const me = this;

        if (!Config.Debug.Global)
            return;

        if (!!event.repeat)
            return;
            
        if (event.key == 'r') {
            // me._scene.input.mouse.releasePointerLock();
            Utils.debugLog('restart');
            return me._scene.scene.start('game');
        }

        if (Utils.stringIsDigit(event.key)) {
            const value = +event.key;
            me._onDiceRoll(value);
        }
    }

    _onDiceRoll(value) {
        const me = this;

        let available = me._players.getAvailableSteps(value);
        available = available.concat(me._getBonusToChoose(value));
        me._context.setRoll(value);
        me._context.setAvailableSteps(available);
        me._context.setState(Enums.GameState.MAKE_STEP);

        if (available.length === 0)
            return me._finishTurn();

        if (me._context.player !== Enums.Player.HUMAN) {
            const step = me._ai[me._context.player].getStep();
            return me._makeStep(step);
        }
    }

    _updateDebugLog() {
        const me = this;

        if (!Utils.isDebug(Config.Debug.TraceLog))
            return;

        let text = 
            `mse: ${me._scene.input.activePointer.worldX} ${me._scene.input.activePointer.worldY}\n` +
            `crs: ${me._carousel._cards.map(x => !!x ? x.bonusType : '-')}\n` +
            `lvl: ${me._carousel._minCount}\n` +
            `pck: ${me._carousel._packSize}`;

        me._log.setText(text);
    }

    _tryMakeStep(point) {
        const me = this;

        const spawnStep = Utils.firstOrNull(me._context.availableSteps, c => c.from.index === Consts.Undefined);
        if (spawnStep != null && me._players.isStorageClick(point))
            return me._makeStep(spawnStep);

        const bonusStep = Utils.firstOrNull(me._context.availableSteps, step => !!step.bonus);
        if (bonusStep != null && me._carousel.tryCardClick(me._context.roll, point))
            return me._makeStep(bonusStep);

        const cell = me._board.findCell(point);
        if (cell.row === Consts.Undefined)
            return;

        const step = Utils.firstOrNull(
            me._context.availableSteps, 
            c => c.from.row === cell.row && c.from.col === cell.col);

        if (step === null)
            return;
            
        return me._makeStep(step);
    }

    _makeStep(step) {
        const me = this;

        return !!step.bonus
            ? me._makeBonusStep(step.bonus)
            : me._players.makeStep(
                step, 
                () => me._onPlayerStep(step), 
                me);
    }

    _onPlayerStep(step) {
        const me = this;

        if (me._players.tryKill(step.to, me._finishTurn, me))
            return;

        me._finishTurn();
    }

    _finishTurn() {
        const me = this;

        const winner = me._players.findWnner();
        if (winner != null)
            return me._gameOver(winner);

        me._carousel.roll(me._getBonusesToCreate(), me._nextTurn, me);
    }

    _nextTurn() {
        const me = this;

        me._context.setPlayer((me._context.player + 1) % Config.PlayerCount);
        me._context.setState(Enums.GameState.DICE_ROLL);

        if (me._context.player !== Enums.Player.HUMAN)
            return me._dice.roll(true, me._onDiceRoll, me);
    }

    _gameOver(winner) {
        const me = this;

        if (winner === Enums.Player.HUMAN)
            console.log("===== YOU WIN ====");
        else 
            console.log("===== YOU LOSE =( =====");

        me._context.setState(Enums.GameState.GAME_OVER)
    }

    _getBonusToChoose(value) {
        const me = this;

        const bonus = me._carousel.getBonusType(value);

        const result = [];
        if (me._context.player !== Enums.Player.HUMAN || bonus == Consts.Undefined)
            return result;

        const isAvailable = me._checkBonus(bonus);
        if (!isAvailable)
            return result;
            
        const dummy = new Cell();
        result.push({ from: dummy, to: dummy, bonus: bonus });
        return result;
    }

    _getBonusesToCreate() {
        const me = this;

        const bonuses = [
            Enums.Bonus.DICE_6,
            Enums.Bonus.REROLL,
            Enums.Bonus.CARD_PACK
        ];

        for (let i = 1; i <= 5; ++i)
            if (me._context.player === Enums.Player.HUMAN 
                && me._players.getAvailableSteps(i).length > 0)
                bonuses.push(i);

        if (me._carousel._minCount > Config.Carousel.Min)
            bonuses.push(Enums.Bonus.LESS_CARDS);

        if (me._carousel._minCount < Config.Carousel.Max)
            bonuses.push(Enums.Bonus.MORE_CARDS);

        return bonuses;
    }

    _checkBonus(bonus) {
        const me = this;

        switch (bonus) {
            case Enums.Bonus.DICE_1:
            case Enums.Bonus.DICE_2:
            case Enums.Bonus.DICE_3:
            case Enums.Bonus.DICE_4:
            case Enums.Bonus.DICE_5:
            case Enums.Bonus.DICE_6:
                return me._players.getAvailableSteps(bonus).length > 0;

            case Enums.Bonus.LESS_CARDS:
                return me._carousel._minCount > Config.Carousel.Min;

            case Enums.Bonus.MORE_CARDS:
                return me._carousel._minCount < Config.Carousel.Max;

            case Enums.Bonus.CARD_PACK:
            case Enums.Bonus.REROLL:
                return true;

            default:
                throw `unknown bonus type: ${bonus}`;
        }
    }

    _makeBonusStep(bonus) {
        const me = this;

        switch (bonus) {
            case Enums.Bonus.DICE_1:
            case Enums.Bonus.DICE_2:
            case Enums.Bonus.DICE_3:
            case Enums.Bonus.DICE_4:
            case Enums.Bonus.DICE_5:
            case Enums.Bonus.DICE_6:
                return me._dice.roll(false, me._onDiceRoll, me, bonus);

            case Enums.Bonus.LESS_CARDS: {
                me._carousel.changeLevel(-1);
                return me._finishTurn();
            }

            case Enums.Bonus.MORE_CARDS: {
                me._carousel.changeLevel(+1);
                return me._finishTurn();
            }

            case Enums.Bonus.CARD_PACK: {
                me._carousel.startPack();
                return me._finishTurn();
            }

            case Enums.Bonus.REROLL: 
                return me._dice.roll(false, me._onDiceRoll, me);

            default:
                throw `unknown bonus type: ${bonus}`;
        }
    }
}