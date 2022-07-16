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
        me._players = new Players(scene, me._board, me._context);

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
            me._tryMovePiece(point);
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
            me._scene.scene.start('game');
            return;
        }

        if (Utils.stringIsDigit(event.key)) {
            const value = +event.key;
            me._onDiceRoll(value);
        }
    }

    _onDiceRoll(value) {
        const me = this;

        const available = me._players.getAvailableSteps(value);
        me._context.setAvailableSteps(available);
        me._context.setState(Enums.GameState.MAKE_STEP);
    }

    _updateDebugLog() {
        const me = this;

        if (!Utils.isDebug(Config.Debug.TraceLog))
            return;

        let text = 
            `mse: ${me._scene.input.activePointer.worldX} ${me._scene.input.activePointer.worldY}`;

        me._log.setText(text);
    }

    _tryMovePiece(point) {
        const me = this;

        const cell = me._board.findCell(point);
        if (cell.row === Consts.Undefined)
            return null;

        const step = Utils.firstOrNull(me._context.availableSteps, c => c.from.row === cell.row && c.from.col === cell.col);
        if (step === null)
            return false;

        me._players.makeStep(step.from, step.to, () => me._onPlayerStep(step), me);
    }

    _onPlayerStep(step) {
        const me = this;

        me._players.tryKill(step.to);

        me._context.setState(Enums.GameState.DICE_ROLL);
    }
}