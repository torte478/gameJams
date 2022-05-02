import Phaser from '../lib/phaser.js';

import AI from './Entities/AI.js';
import Context from './Entities/Context.js';
import Cards from './Entities/Cards.js';
import Groups from './Entities/Groups.js'; 
import HUD from './Entities/HUD.js';
import Player from './Entities/Player.js';
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

        if (deltaY > 0)
            me._hud.show();
        else if (deltaY < 0)
            me._hud.hide();
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
        }

        if (!(isNaN(event.key)))
            me._debugDropDices(+event.key);
    }

    _debugDropDices(value) {
        const me = this;

        if (me._context.status.state !== Enums.GameState.BEGIN)
            return;

        Utils.debugLog(`debug drop: ${value}`);
        me._applyDiceDrop(value, 0);        
    }

     _processHumanTurn(point, isRightButton) {
        const me = this;

        if (!me._isHumanTurn())
            return;

        me._processTurn(point, isRightButton);
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

        if (billIndex >= 0) {
            const taked = current.hand.tryMakeAction(
                point,
                Enums.HandAction.TAKE_BILL,
                { index: billIndex },
                () => {
                    current.player.takeBill(billIndex);

                    const action = current.hand.getMoneyAction();
                    if (action == null)
                        return false;

                    if (action == Enums.ActionType.MERGE_MONEY)
                        current.player.hideButton(Enums.ActionType.SPLIT_MONEY);

                    current.player.showButtons([ action ], true);
                }
            );
            return taked;
        }

        if (current.player.canClickButton(point, Enums.ActionType.SPLIT_MONEY)) {
            current.hand.tryMakeAction(
                point,
                Enums.HandAction.CLICK_BUTTON,
                null,
                () => {
                    const money = current.hand.dropBills();
                    const splited = Helper.splitBillToBills(money);
                    current.player.hideButton(Enums.ActionType.SPLIT_MONEY);
                    me._addBills(splited, point, current.player);
                }
            );
            return true;
        }

        if (current.player.canClickButton(point, Enums.ActionType.MERGE_MONEY)) {
            current.hand.tryMakeAction(
                point,
                Enums.HandAction.CLICK_BUTTON,
                null,
                () => {
                    const money = current.hand.dropBills();
                    const merged = Helper.mergeBills(money);
                    current.player.hideButton(Enums.ActionType.MERGE_MONEY);
                    me._addBills(merged, point, current.player);
                }
            );
            return true;
        }

        return false;
    }

    _applyDiceDrop(first, second) {
        const me = this;

        const current = me._context.status.pieceIndicies[me._context.status.player];
        me._context.status.targetFieldIndex = (current + first + second) % Consts.FieldCount;
        me._context.status.diceResult = first + second;

        for (let i = 0; i < Config.PlayerCount; ++i)
            me._updateRent(i);

        me._setState(Enums.GameState.DICES_DROPED);
    }

    _cancelTurn() {
        const me = this;

        const current = me._getCurrent();
        const money = current.hand.dropBills();
        me._addBills(money, current.hand.toPoint(), current.player);

        current.player.showButtons([]);

        me._context.status.selectedField = null;
        const next = me._gameState.getNextStateAfterCancel();

        me._context.status.isBusy = true;
        current.hand.cancel(() => {
            me._context.status.isBusy = false;
            me._setState(next);
        });
    }

    _finishTurn() {
        const me = this;

        me._getCurrent().hand.toWait();
        me._context.status.player = me._context.status.getNextPlayerIndex();
        me._hud.select(me._context.status.player);
        if (me._context.status.player != Enums.Player.HUMAN)
            me._ai[me._context.status.player].resetState();
        
        for (let i = 0; i < me._context.players.length; ++i)
            me._context.players[i].showButtons(i == me._context.status.player);

        me._context.status.reset();
        me._timers[Enums.TimerIndex.TURN].reset();
        me._setState(Enums.GameState.BEGIN);
    }

    _getCurrent() {
        const me = this;

        const current = me._context.status.player;
        return {
           player: me._context.players[current],
           hand: me._context.hands[current],
           ai: me._ai[current]
        };
    }

    _killPlayer() {
        const me = this;

        const current = me._getCurrent();
        if (current.player.index == Enums.Player.HUMAN) {
            throw 'YOU LOSE!';
        }

        me._context.status.activePlayers = me._context.status.activePlayers.filter(
            (p) => p != current.player.index);

        if (me._context.status.activePlayers.length == 1) {
            throw 'YOU WIN!!!'
        }        

        me._context.fields.removePiece(
            me._context.status.pieceIndicies[current.player.index], 
            current.player.index);

        const piece = me._context.pieces[current.player.index].toGameObject(); 
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

        me._context.hands[current.player.index].hide();

        const playerCards = [];
        for (let i = 0; i < Consts.FieldCount; ++i) {
            if (current.player.hasField(i)) {
                me._context.fields.sellField(i);
                playerCards.push(i);
            }
        }

        me._cards.sellAll(playerCards);

        current.player.kill();

        me._hud.updateMoney(current.player.index, 0, 0);

        Utils.debugLog(`Player ${Utils.enumToString(Enums.Player, me._context.status.player)} lose!`);
        me._finishTurn();
    }

    _trySelectOwnField(point) {
        const me = this;

        if (!Utils.contains(Consts.States.SellField, me._context.status.state))
            return false;

        let field = me._context.fields.getFieldIndex(point);
        if (field == null)       
            field = me._cards.getFieldIndex(point);

        if (field == null)
            return false;

        if (!Utils.contains(Consts.BuyableFieldTypes, FieldInfo.Config[field].type))
            return false;

        const current = me._getCurrent();
        if (!current.player.hasField(field))
            return false;

        current.hand.tryMakeAction(
            point,
            Enums.HandAction.CLICK_BUTTON,
            null,
            () => {
                me._context.status.selectedField = field;
                me._context.status.stateToReturn = me._context.status.state;

                const actions = [];

                const action = current.player.canSellSmth(field);
                if (action != null)
                    actions.push(action);
                
                const canBuyHouse = current.player.canBuyHouse(field)
                                    && me._context.status.isBuyHouseAvailable();
                if (canBuyHouse) 
                    actions.push(Enums.ActionType.BUY_HOUSE);

                current.player.showButtons(actions);

                Utils.debugLog(`select field ${field}`);
                me._setState(Enums.GameState.OWN_FIELD_SELECTED);
        });

        return true;
    }

    _setState(state) {
        const me = this;

        me._gameState.showButtons();
        me._context.status.setState(state);
        me._gameState = State.next(state, me);
        me._restoreSelection();
    }

    _getCursorOffset() {
        const me = this;

        return Utils.buildPoint(
            me._cursor.x + 100,
            me._cursor.y + 200);
    }

    _onPieceDrop(field) {
        const me = this;

        const current = me._getCurrent(); 
        me._context.status.pieceIndicies[me._context.status.player] = me._context.status.targetFieldIndex;

        const fieldConfig = FieldInfo.Config[field.index];

        if (fieldConfig.type == Enums.FieldType.GOTOJAIL)
            return me._moveToJail(field.index);

        if (!Utils.contains(Consts.BuyableFieldTypes, fieldConfig.type))
            return me._setState(Enums.GameState.FINAL);
            
        const enemyIndex = Utils.firstOrDefaultIndex(
            me._context.players, 
            (p) => p.index != me._context.status.player && p.hasField(field.index));

        if (enemyIndex != null) {
            const rent = me._context.players[enemyIndex].getRent(field.index, me._context.status.diceResult);
            
            if (rent > current.player.getTotalMoney())
                return me._killPlayer();

            me._context.status.setPayAmount(rent);

            me._context.hands[enemyIndex].prepareToRent();
            
            return me._setState(Enums.GameState.PIECE_ON_ENEMY_FIELD);
        }

        const canBuyField = me._isHumanTurn() || current.ai.canBuyField(field.index);

        if (!current.player.hasField(field.index) && canBuyField) {
            me._context.status.setPayAmount(fieldConfig.cost);
            return me._setState(Enums.GameState.PIECE_ON_FREE_FIELD);
        }

        return me._setState(Enums.GameState.FINAL)
    }

    _moveToJail(fieldFrom) {
        const me = this;

        const jail = me._context.fields.movePiece(
            me._context.status.player, 
            fieldFrom, 
            Consts.JailFieldIndex, 
            true);

        me._context.status.pieceIndicies[me._context.status.player] = Consts.JailFieldIndex;

        me._context.status.isBusy = true;
        return me._scene.tweens.add({
            targets: me._context.pieces[me._context.status.player].toGameObject(),
            x: jail.x,
            y: jail.y,
            ease: 'Sine.easeInOut',
            duration: Utils.getTweenDuration(
                Utils.toPoint(me._context.pieces[me._context.status.player].toGameObject()),
                jail,
                Consts.Speed.HandAction
            ),
            onComplete: () => { 
                me._context.status.isBusy = false;
                me._finishTurn();
            }
        });
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

        me._scene.input.mouse.releasePointerLock();
        me._scene.tweens.pauseAll();
        me._timers[Enums.TimerIndex.TURN].pause();
        me._context.status.isPause = true;
        me._fade.setVisible(true);
    }

    _unpause() {
        const me = this;

        me._scene.tweens.resumeAll();
        me._context.status.isPause = false;
        me._timers[Enums.TimerIndex.TURN].resume();
        me._restoreSelection();
        me._fade.setVisible(false);
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

        if (Config.Debug.Global && Config.Debug.IgnorePause)
            return false;

        if (!me._scene.input.mouse.locked) {
            if (!me._context.status.isPause)
                me._pause();

            return true;
        } else if (me._context.status.isPause) {
            me._unpause();
            return false;
        }
    }

    _updateLightGame(delta) {
        const me = this;

        const skipTurn = Config.Debug.Global 
                && Config.Debug.SkipHuman
                && !me._context.status.isBusy 
                && me._context.status.player == Enums.Player.HUMAN;

        if (me._timers[Enums.TimerIndex.TURN].check() || skipTurn) {
            Utils.debugLog('Turn timeout!');

            me._cancelTurn();
            me._moveToJail(me._context.status.pieceIndicies[me._context.status.player]);
            me._timers[Enums.TimerIndex.TURN].pause();
            return;
        }

        if (me._isHumanTurn()) {
            const target = me._getCursorOffset();
            me._getCurrent().hand.moveTo(target, delta);
        } else {
            me._processCpuTurn();
        }
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

        me._setState(Enums.GameState.BEGIN);
    }

    _updateGame(delta) {
        const me = this;

        if (me._context.status.state != Enums.GameState.DARK) {
            if (me._timers[Enums.TimerIndex.LIGHT].check()) 
                return me._startDark();

            me._updateLightGame(delta);
        } else {
            if (me._timers[Enums.TimerIndex.DARK].check())
                return me._stopDark();
        }
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

        let fieldIndex = me._context.fields.getFieldIndex(point);
        if (fieldIndex == null)
            fieldIndex = me._cards.getFieldIndex(point);

        fieldIndex != null
            ? me._hud.showField(fieldIndex)
            : me._hud.hideField();
    }
}