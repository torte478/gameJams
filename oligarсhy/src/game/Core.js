import Phaser from '../lib/phaser.js';

import AI from './Entities/AI.js';
import Context from './Entities/Context.js';
import Cards from './Entities/Cards.js';
import Groups from './Entities/Groups.js'; 
import HUD from './Entities/HUD.js';
import Timer from './Entities/Timer.js';

import State from './StateMachine/State.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import FieldInfo from './FieldInfo.js';
import Helper from './Helper.js';
import Utils from './Utils.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {HUD} */
    _hud;

    /** @type {Phaser.GameObjects.Image} */
    _cursor;

    /** @type {Cards} */
    _cards;

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Groups} */
    _groups;

    /** @type {Timer[]} */
    _timers;

    /** @type {Phaser.GameObjects.Image} */
    _fade;

    /** @type {AI[]} */
    _ai;

    /** @type {Context} */
    _context;

    /** @type {State} */
    _gameState;

    /**
     * @param {Number} delta 
     */
    update(delta) {
        const me = this;

        me._updateDebugLog();

        if (me._checkPause())
            return;

        me._updateGame(delta);
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     */
    onPointerMove(pointer) {
        const me = this;

        if (me._context.status.isPause) 
            return;

        me._updateCursorPos(pointer);

        const point = Utils.toPoint(me._cursor);
        me._updateFieldHud(point);
        me._updateButtonSelection(point);
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     */
    onPointerDown(pointer) {
        const me = this;

        const isCursorActive = me._scene.input.mouse.locked;

        if (isCursorActive) {
            const point = Utils.toPoint(me._cursor);
            me._processHumanTurn(point, pointer.rightButtonDown());
        }
        else {
            me._scene.input.mouse.requestPointerLock();
            me._cursor.setVisible(true);

            me._scene.cameras.main.startFollow(me._cursor, true, 0.05, 0.05);    
        }
    }

    /**
     * @param {Number} deltaY 
     */
    onMouseWheel(deltaY) {
        const me = this;

        if (me._context.status.isPause)
            return;

        const showHud = deltaY > 0;
        me._hud.updateVisibility(showHud);
    }

    /**
     * @param {KeyboardEvent} event 
     */
    onKeyDown(event) {
        const me = this;

        if (!Config.Debug.Global)
            return;
            
        if (event.key == 'r') {
            scene.input.mouse.releasePointerLock();
            scene.start('game');
            return;
        }

        if (Utils.stringIsDigit(event.key)) {
            const value = +event.key;
            me._debugDropDices(value);
        }
    }

    _debugDropDices(value) {
        const me = this;

        if (me._context.status.state !== Enums.GameState.BEGIN)
            return;

        Utils.debugLog(`debug drop: ${value}`);
        me._applyDiceDrop(value, 0);        
    }

     _processHumanTurn(point, isCancel) {
        const me = this;

        if (me._isHumanTurn())
            me._processTurn(point, isCancel);
    }

    _processCpuTurn() {
        const me = this;

        const playerIndex = me._context.status.player;
        const ai = me._ai[playerIndex];
        const point = me._gameState.getAiNextPoint(ai);

        if (point != null)
            me._processTurn(point, false);
    }

    _isHumanTurn() {
        const me = this;

        return me._context.status.player == Enums.Player.HUMAN;
    }

     _processTurn(point, isCancel) {
        const me = this;

        if (me._getCurrent().hand.isBusy() || me._context.status.isBusy)
            return;

        if (isCancel)
            return me._cancelTurn();

        if (me._trySelectOwnField(point))
            return;

        return me._gameState.processTurn(point);
    }

    _tryManageMoney(point) {
        const me = this;

        const current = me._getCurrent();
        const billIndex = current.player.findBillOnPoint(point);

        const canTakeMoney = billIndex >= 0;
        if (canTakeMoney) 
            return current.hand.tryMakeAction(
                point,
                Enums.HandAction.TAKE_BILL,
                { index: billIndex },
                () => { me._takeBill(billIndex); });

        const canSplitMoney = current.player.canClickButton(point, Enums.ActionType.SPLIT_MONEY);
        if (canSplitMoney)
            return current.hand.tryMakeAction(
                point,
                Enums.HandAction.CLICK_BUTTON,
                null,
                () => { me._manageMoney(point, Enums.ActionType.SPLIT_MONEY) });

        const canMergeMoney = current.player.canClickButton(point, Enums.ActionType.MERGE_MONEY);
        if (canMergeMoney)
            return current.hand.tryMakeAction(
                point,
                Enums.HandAction.CLICK_BUTTON,
                null,
                () => { me._manageMoney(point, Enums.ActionType.MERGE_MONEY) });

        return false;
    }

    _manageMoney(point, action) {
        const me = this,
              current = me._getCurrent();

        const bills = current.hand.dropBills();
        const newBills = Helper.manageBills(bills, action);

        current.player.hideButton(action);

        me._addBills(newBills, point, current.player);
    }

    _takeBill(billIndex) {
        const me = this,
              current = me._getCurrent();

        current.player.takeBill(billIndex);

        const availableAction = current.hand.getAvailableMoneyAction();
        if (availableAction == null)
            return false;

        if (availableAction == Enums.ActionType.MERGE_MONEY)
            current.player.hideButton(Enums.ActionType.SPLIT_MONEY);

        current.player.showButtons([ availableAction ], true);
    }

    _applyDiceDrop(first, second) {
        const me = this;

        const currentFieldIndex = me._context.status.pieceIndicies[me._context.status.player];
        me._context.status.targetFieldIndex = (currentFieldIndex + first + second) % Consts.FieldCount;
        me._context.status.diceResult = first + second;

        for (let i = 0; i < Config.PlayerCount; ++i)
            me._updateRent(i);

        me._setState(Enums.GameState.DICES_DROPED);
    }

    _cancelTurn() {
        const me = this,
              current = me._getCurrent();

        const money = current.hand.dropBills();
        me._addBills(money, current.hand.toPoint(), current.player);

        current.player.showButtons([]);

        me._context.status.selectedField = null;
        const nextState = me._gameState.getNextStateAfterCancel();

        me._context.status.isBusy = true;
        current.hand.cancel(() => {
            me._context.status.isBusy = false;
            me._setState(nextState);
        });
    }

    _finishTurn() {
        const me = this;

        me._getCurrent().hand.toWait();
        const nextPlayer = me._context.status.setNextPlayerIndex();
        me._hud.select(nextPlayer);

        if (nextPlayer != Enums.Player.HUMAN)
            me._ai[nextPlayer].resetState();
        
        for (let i = 0; i < me._context.players.length; ++i)
            me._context.players[i].showButtons(i == nextPlayer);

        me._context.status.reset();
        me._timers[Enums.TimerIndex.TURN].reset();
        me._setState(Enums.GameState.BEGIN);
    }

    _getCurrent() {
        const me = this;

        const current = me._context.status.player;
        // TODO : extract improved player class
        return {
           player: me._context.players[current],
           hand: me._context.hands[current],
           ai: me._ai[current]
        };
    }

    _processGameOver(gameOverType) {
        const me = this;

        throw `GAME OVER: ${Utils.enumToString(Enums.PlayerDeathResult, gameOverType)}`;
    }

    _killPlayer() {
        const me = this,
              current = me._getCurrent(),
              playerIndex = current.player.index;

        const result = me._context.status.killCurrentPlayer();
        if (result !== Enums.PlayerDeathResult.CONTINUE)
            return me._processGameOver(result);

        me._removePiece(playerIndex);
        me._context.hands[playerIndex].hide(); // TODO: hide hand animation
        me._sellAllCards(current.player);
        current.player.kill();
        me._hud.updateMoney(playerIndex, 0, 0);

        Utils.debugLog(`Player ${Utils.enumToString(Enums.Player, playerIndex)} lose!`);

        me._finishTurn();
    }

    _sellAllCards(player) {
        const me = this;

        const playerCards = [];
        for (let i = 0; i < Consts.FieldCount; ++i) {
            if (player.hasField(i)) {
                me._context.fields.sellField(i);
                playerCards.push(i);
            }
        }

        me._cards.sellAll(playerCards);
    }

    _removePiece(playerIndex) {
        const me = this;

        me._context.fields.removePiece(
            me._context.status.pieceIndicies[playerIndex], 
            playerIndex);

        const piece = me._context.pieces[playerIndex].toGameObject(); 
        const target = Utils.buildPoint(0, 0);
        me._scene.tweens.add({
            targets: piece,
            x: target.x,
            y: target.y,
            alpha: { from: 1, to: 0 },
            ease: 'Sine.easeIn',
            duration: Utils.getTweenDuration(
                Utils.toPoint(piece), 
                target, 
                Consts.Speed.CenterEntranceDuration)
        });
    }

    _trySelectOwnField(point) {
        const me = this,
              current = me._getCurrent(),
              player = current.player;

        if (!Utils.contains(Consts.States.Sell, me._context.status.state))
            return false;

        const field = me._findFieldIndex(point);
        if (field == null)
            return false;

        if (!Utils.contains(Consts.BuyableFieldTypes, FieldInfo.Config[field].type))
            return false;

        if (!player.hasField(field))
            return false;

        return current.hand.tryMakeAction(
            point,
            Enums.HandAction.CLICK_BUTTON,
            null,
            () => { me._clickButton(player, field) });
    }

    _clickButton(player, field) {
        const me = this,
              status = me._context.status;

        status.selectedField = field;
        status.stateToReturn = status.state;

        const actions = me._getFieldActions(player, field);
        player.showButtons(actions);

        Utils.debugLog(`select field ${field}`);

        me._setState(Enums.GameState.OWN_FIELD_SELECTED);
    }

    _getFieldActions(player, field) {
        const me = this,
              result = [];

        const sellAction = player.canSellSmth(field);
        if (sellAction != null)
            result.push(sellAction);
        
        const canBuyHouse = player.canBuyHouse(field)
                            && me._context.status.isBuyHouseAvailable();
        if (canBuyHouse) 
            result.push(Enums.ActionType.BUY_HOUSE);

        return result;
    }

    _setState(state) {
        const me = this;

        me._gameState.showButtons();
        me._context.status.setState(state);
        me._gameState = State.next(state, me);
        me._restoreSelection();
    }

    _moveToJail(fieldFrom) {
        const me = this,
              status = me._context.status;

        const jail = me._context.fields.movePiece(
            status.player, 
            fieldFrom, 
            Consts.JailFieldIndex, 
            true);

        status.pieceIndicies[status.player] = Consts.JailFieldIndex;
        status.isBusy = true;

        const piece = me._context.pieces[status.player].toGameObject();

        return Utils.startMovementTween(
            me._scene,
            piece,
            jail,
            Consts.Speed.HandAction,
            () => {
                status.isBusy = false;
                me._finishTurn();
            }
        );
    }

    _updateRent(playerIndex) {
        const me = this;

        const player = me._context.players[playerIndex];

        for (let i = 0; i < Consts.FieldCount; ++i)
            if (player.hasField(i)) {
                const rent = player.getRent(i, me._context.status.diceResult);
                me._context.fields.updateRent(i, playerIndex, rent)
            }      
    }

    _buyField(field, playerIndex, ignoreTween) {
        const me = this;

        const cardGrid = me._context.players[playerIndex].addField(field);
        me._context.fields.buyField(field, playerIndex);
        me._cards.buy(field, playerIndex, cardGrid, ignoreTween);
    }

    _addMoney(value, from, player) {
        const me = this;

        const bills = Helper.splitValueToBills(value);

        me._addBills(bills, from, player);
    }

    _addBills(bills, from, player) {
        const me = this;

        player.addBills(bills);

        me._hud.updateMoney(
            player.index, 
            player.getBillsMoney(),
            player.getFieldsCost());

        const billIndicies = Helper.enumBills(bills);

        for (let i = 0; i < billIndicies.length; ++i) {
            const bill = me._groups.createBill(
                from.x,
                from.y,
                player.index,
                billIndicies[i]);

            const target = player.getBillPosition(billIndicies[i]);

            me._scene.tweens.add({
                targets: bill,
                x: target.x,
                y: target.y,
                ease: 'Sine.easeOut',
                duration: Utils.getTweenDuration(
                    from, 
                    target, 
                    Consts.Speed.CenterEntranceDuration),
                delay: i * 50,
                onComplete: () => {
                    me._groups.killBill(bill);
                }
            });
        }
    }

    _pause() {
        const me = this;

        if (!me._context.status.isPause)
            return;

        me._scene.input.mouse.releasePointerLock();
        me._scene.tweens.pauseAll();
        me._context.status.isPause = true;
        me._fade.setVisible(true);

        for (let i = 0; i < me._timers.length; ++i)
            me._timers[i].pause();
    }

    _unpause() {
        const me = this;

        me._scene.tweens.resumeAll();
        me._context.status.isPause = false;
        me._restoreSelection();
        me._fade.setVisible(false);

        // TODO : extract dark logic code (+everywhere)
        if (me._context.status.state === Enums.GameState.DARK) {
            me._timers[Enums.TimerIndex.DARK].resume();    
        } else {
            me._timers[Enums.TimerIndex.TURN].resume();
            me._timers[Enums.TimerIndex.LIGHT].resume();
        }
    }

    _restoreSelection() {
        const me = this;

        if (me._isHumanTurn())
            return me._gameState.restoreSelection();
            
        me._context.dice1.unselect();
        me._context.dice2.unselect();
        me._context.pieces[Enums.Player.HUMAN].unselect();
        me._context.fields.unselect();
    }

    _checkPause() {
        const me = this;

        if (Utils.isDebug(Config.Debug.IgnorePause))
            return false;

        const isMouseOutsideView = !me._scene.input.mouse.locked;
        if (isMouseOutsideView) {
            me._pause();
            return true;
        } 
        
        if (me._context.status.isPause)
            me._unpause();

        return false;
    }

    _updateLightGame(delta) {
        const me = this;

        if (me._checkTurnEnd())
            return;

        me._isHumanTurn()
            ? me._moveHumanHand(delta)
            : me._processCpuTurn();
    }

    _checkTurnEnd() {
        const me = this,
              status = me._context.status;

        const skipTurn = Utils.isDebug(Config.Debug.SkipHuman)
                         && !status.isBusy 
                         && status.player == Enums.Player.HUMAN;

        if (!skipTurn && !me._timers[Enums.TimerIndex.TURN].check())
            return false;

        Utils.debugLog('Turn timeout!');

        me._cancelTurn();
        me._moveToJail(status.pieceIndicies[status.player]);
        me._timers[Enums.TimerIndex.TURN].pause();
        return true;
    }

    _moveHumanHand(delta) {
        const me = this;

        const offset = Utils.buildPoint(
            me._cursor.x + 100,
            me._cursor.y + 200);

        me._getCurrent().hand.moveTo(offset, delta);
    }

    _startDark() {
        const me = this;

        me._timers[Enums.TimerIndex.LIGHT].pause();
        me._timers[Enums.TimerIndex.TURN].pause();
        me._timers[Enums.TimerIndex.DARK].reset();

        me._setState(Enums.GameState.DARK);
    }

    _stopDark() {
        const me =this;

        me._timers[Enums.TimerIndex.LIGHT].reset();
        me._timers[Enums.TimerIndex.TURN].reset();
        me._timers[Enums.TimerIndex.DARK].pause();

        me._setState(Enums.GameState.BEGIN);
    }

    _updateGame(delta) {
        const me = this;

        // TODO : split to Dark and Light state (pattern)
        if (me._context.status.state === Enums.GameState.DARK) {
            if (me._timers[Enums.TimerIndex.DARK].check())
                return me._stopDark();

            me._updateDarkGame(delta);
        } else {
            if (me._timers[Enums.TimerIndex.LIGHT].check()) 
                return me._startDark();

            me._updateLightGame(delta);
        }
    }

    _updateDarkGame(delta) {
        const me = this;
    }

    _updateDebugLog() {
        const me = this;

        if (!Config.Debug.Global || !Config.Debug.ShowTextLog)
            return;

        let text = 
            `ptr: ${me._cursor.x | 0} ${me._cursor.y | 0}\n` + 
            `mse: ${me._scene.input.activePointer.worldX} ${me._scene.input.activePointer.worldY}\n` + 
            `trn: ${(me._timers[Enums.TimerIndex.TURN].getRemain()) / 1000 | 0}\n` +
            `lgt: ${(me._timers[Enums.TimerIndex.LIGHT].getRemain()) / 1000 | 0}\n` +
            `drk: ${(me._timers[Enums.TimerIndex.DARK].getRemain()) / 1000 | 0}\n` +
            `pse: ${!me._scene.input.mouse.locked}`;
        me._log.setText(text);
    }

    _updateCursorPos(pointer) {
        const me = this;

        me._cursor.x += pointer.movementX;
        me._cursor.y += pointer.movementY;
    }

    _updateButtonSelection(point) {
        const me = this;

        if (me._isHumanTurn())
            me._getCurrent().player.updateButtonSelection(point);
    }

    _updateFieldHud(point) {
        const me = this;

        const fieldIndex = me._findFieldIndex(point);

        fieldIndex != null
            ? me._hud.showField(fieldIndex)
            : me._hud.hideField();
    }

    _findFieldIndex(point) {
        const me = this;

        let fieldIndex = me._context.fields.getFieldIndex(point);
        if (fieldIndex == null)
            fieldIndex = me._cards.findFieldIndex(point);

        return fieldIndex;
    }
}