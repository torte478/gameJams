import Phaser from '../lib/phaser.js';

import Player from './Entities/Player.js';
import Fields from './Entities/Fields.js';
import Cards from './Entities/Cards.js';
import Groups from './Entities/Groups.js'; 
import Hand from './Entities/Hand.js';
import HUD from './Entities/HUD.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Status from './Status.js';
import Utils from './Utils.js';
import Helper from './Helper.js';
import Timer from './Entities/Timer.js';
import Dice from './Entities/Dice.js';
import Piece from './Entities/Piece.js';
import AI from './Entities/AI.js';
import Context from './Entities/Context.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Hand[]} */
    _hands;

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

    /** @type {Timer} */
    _turnTimer;

    /** @type {Phaser.GameObjects.Image} */
    _fade;

    /** @type {AI[]} */
    _ai;

    /** @type {Context} */
    _context;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        // Phaser

        scene.physics.world.setBounds(-2500, -2500, 5000, 5000);

        scene.cameras.main
            .setScroll(
                Config.Start.CameraPosition.x - Consts.Viewport.Width / 2,
                Config.Start.CameraPosition.y - Consts.Viewport.Height / 2)
            .setBounds(
                scene.physics.world.bounds.x,
                scene.physics.world.bounds.y,
                scene.physics.world.bounds.width,
                scene.physics.world.bounds.height);

        // Custom

        me._scene = scene;
        me._context = new Context();

        const factory = scene.add;

        me._cursor = me._createCursor(scene);

        me._context.status = new Status(Config.Start.PiecePositions, Config.Start.Player, Config.Start.State);

        const level = [
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        ];

        const map = scene.make.tilemap({ data: level, tileWidth: 500, tileHeight: 500 });
        const tiles = map.addTilesetImage('table');
        const layer = map.createLayer(0, tiles, -2750, -2750);

        me._context.fields = new Fields(scene, Config.Start.PiecePositions);

        me._context.pieces = [];
        for (let player = 0; player < Config.Start.PlayerCount; ++player) {
            const position = me._context.fields.movePiece(player, 0, Config.Start.PiecePositions[player]);

            const piece = new Piece(scene, position.x, position.y, player);

            me._context.pieces.push(piece);
        }

        me._context.dice1 = new Dice(scene, 0, 0, 2);

        me._context.dice2 = new Dice(
            scene,
            Consts.SecondDiceOffset.X, 
            Consts.SecondDiceOffset.Y,
            6);

        scene.physics.add.collider(me._context.dice1.toGameObject(), me._context.dice2.toGameObject());

        me._hands = [];
        for (let i = 0; i < Config.Start.PlayerCount; ++i)
            me._hands.push(new Hand(scene, i));

        me._groups = new Groups(scene);
        me._cards = new Cards(scene);

        me._context.players = [];
        for (let i = 0; i < Config.Start.PlayerCount; ++ i) {
            const player = new Player(scene, i, Config.Start.Money, me._groups);
            me._context.players.push(player);

            for (let j = 0; j < Config.Start.Fields[i].length; ++j)
                me._buyField(Config.Start.Fields[i][j], i, true);

            if (Config.Start.Fields[i].length > 0)
                me._updateRent(i);
        }

        me._hud = new HUD(factory);

        for (let i = 0; i < me._context.players.length; ++i)
            me._hud.updateMoney(
                i, 
                me._context.players[i].getBillsMoney(),
                me._context.players[i].getFieldsCost());

        me._turnTimer = new Timer(Config.Start.Time.TurnSec * 1000);
        me._fade = scene.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'fade')
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Fade)
                .setAlpha(0.75)
                .setVisible(false);

        me._ai = [ null ];
        for (let i = 1; i < me._context.players.length; ++i) {
            const ai = new AI(
                me._context.players[i],
                me._hands[i],
                me._context
            );
            me._ai.push(ai);
        }

        me._setState(Config.Start.State);

        // Debug

        if (Config.Debug.Global && Config.Debug.ShowTextLog) {
            me._log = scene.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        }
    }

    update(delta) {
        const me = this;

        if (me._checkPause())
            return;

        const skipTurn = Config.Debug.Global 
                         && Config.Debug.SkipHuman
                         && !me._context.status.isBusy 
                         && me._context.status.player == Enums.Player.HUMAN;

        if (me._turnTimer.check() || skipTurn) {
            Utils.debugLog('Turn timeout!');
            me._cancelTurn();
            me._moveToJail(me._context.status.pieceIndicies[me._context.status.player]);
            me._turnTimer.pause();
            return;
        }

        if (me._isHumanTurn()) {
            const target = me._getCursorOffset();
            me._getCurrentPlayer().hand.moveTo(target, delta);
            
        } else {
            me._processCpuTurn();
        }

        if (Config.Debug.Global && Config.Debug.ShowTextLog) {
            let text = 
            `ptr: ${me._cursor.x | 0} ${me._cursor.y | 0}\n` + 
            `mse: ${me._scene.input.activePointer.worldX} ${me._scene.input.activePointer.worldY}\n` + 
            `trn: ${(me._turnTimer._finishTime - new Date().getTime()) / 1000 | 0}\n` +
            `pse: ${!me._scene.input.mouse.locked}`;
            for (let i = 0; i < Config.Start.PlayerCount; ++i)
                text += `\n[${me._context.players[i].enumBills().join(',')}]`;
            me._log.setText(text)
        }
    }

    onPointerMove(pointer) {
        const me = this;

        if (me._context.status.isPause) 
            return;

        me._cursor.x += pointer.movementX;
        me._cursor.y += pointer.movementY;

        const point = Utils.toPoint(me._cursor);

        let index = me._context.fields.getFieldIndex(point);
        if (index == null)
            index = me._cards.getFieldIndex(point);

        index != null
            ? me._hud.showField(index)
            : me._hud.hideField();

        if (me._isHumanTurn())
            me._getCurrentPlayer().player.updateButtonSelection(point);
    }

    onPointerDown(pointer) {
        const me = this;

        if (me._scene.input.mouse.locked) {
            const point = Utils.toPoint(me._cursor);
            me._processHumanTurn(point, pointer.rightButtonDown());
        }
        else {
            me._scene.input.mouse.requestPointerLock();
            me._cursor.setVisible(true);

            me._scene.cameras.main.startFollow(me._cursor, true, 0.05, 0.05);    
        }
    }

    onMouseWheel(deltaY) {
        const me = this;

        if (me._context.status.isPause)
            return;

        if (deltaY > 0)
            me._hud.show();
        else if (deltaY < 0)
            me._hud.hide();
    }

    debugDropDices(value) {
        const me = this;

        if (me._context.status.state == Enums.GameState.BEGIN) {
            Utils.debugLog(`debug drop: ${value}`);
            me._applyDiceDrop(value, 0);
        }
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Boolean} isRightButton 
     */
     _processHumanTurn(point, isRightButton) {
        const me = this;

        if (!me._isHumanTurn())
            return;

        me._processTurn(point, isRightButton);
    }

    _processCpuTurn() {
        const me = this;

        const point = me._ai[me._context.status.player].nextPoint();

        if (point != null)
            me._processTurn(point, false);
    }

    _isHumanTurn() {
        const me = this;

        return me._context.status.player == Enums.Player.HUMAN;
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Boolean} isCancel 
     */
     _processTurn(point, isCancel) {
        const me = this;

        const currentPlayer = me._getCurrentPlayer();
        const player = currentPlayer.player;
        const hand = currentPlayer.hand;

        if (hand.isBusy() || me._context.status.isBusy)
            return;

        if (isCancel)
            return me._cancelTurn();

        if (me._trySelectOwnField(point))
            return;

        if (Utils.contains(Consts.States.SellField, me._context.status.state) && me._trySelectOwnField(point)) {
                return me._setState(Enums.GameState.OWN_FIELD_SELECTED);
        }

        switch (me._context.status.state) {
            case Enums.GameState.BEGIN: {

                let canTakeDice = hand.tryMakeAction(
                    point,
                    Enums.HandAction.TAKE_DICE,
                    {
                        image: me._context.dice1.toGameObject(),
                        type: Enums.HandState.DICES
                    },
                    () => {
                        me._setState(Enums.GameState.FIRST_DICE_TAKED)
                    });
                
                if (canTakeDice)
                    return;

                hand.tryMakeAction(
                    point,
                    Enums.HandAction.TAKE_DICE,
                    {
                        image: me._context.dice2.toGameObject(),
                        type: Enums.HandState.DICES
                    },
                    () => {
                        me._setState(Enums.GameState.FIRST_DICE_TAKED)
                    });

                break;
            }

            case Enums.GameState.FIRST_DICE_TAKED: {

                let canTakeDice = hand.tryMakeAction(
                    point,
                    Enums.HandAction.TAKE_DICE,
                    {
                        image: me._context.dice1.toGameObject(),
                        type: Enums.HandState.DICES
                    },
                    () => {
                        me._setState(Enums.GameState.SECOND_DICE_TAKED)
                    });
                
                if (canTakeDice)
                    return;

               hand.tryMakeAction(
                    point,
                    Enums.HandAction.TAKE_DICE,
                    {
                        image: me._context.dice2.toGameObject(),
                        type: Enums.HandState.DICES
                    },
                    () => {
                        me._setState(Enums.GameState.SECOND_DICE_TAKED)
                    });

                break;
            }

            case Enums.GameState.SECOND_DICE_TAKED: {

                hand.tryMakeAction(
                    point,
                    Enums.HandAction.DROP_DICES,
                    null,
                    () => {
                        const first = Utils.getRandom(1, 6, 1);
                        const second = Utils.getRandom(1, 6, 0);

                        me._context.dice1.roll('first_dice_roll');
                        me._context.dice2.roll('second_dice_roll');

                        me._context.status.isBusy = true;

                        me._scene.time.delayedCall(
                            Utils.getRandom(1000, 2000, 1000),
                            () => {
                                me._context.dice1.stop(first);
                                me._context.dice2.stop(second);

                                Utils.debugLog(`${first} ${second} (${first + second})`);

                                me._context.status.isBusy = false;
                                me._applyDiceDrop(first, second);    
                            },
                            null,
                            me);
                });

                break;
            }

            case Enums.GameState.DICES_DROPED: {
                
                hand.tryMakeAction(
                    point,
                    Enums.HandAction.TAKE_PIECE,
                    {
                        image: me._context.pieces[me._context.status.player].toGameObject(),
                        type: Enums.HandState.PIECE,
                    },
                    () => { me._setState(Enums.GameState.PIECE_TAKED) });

                break;
            }

            case Enums.GameState.PIECE_TAKED: {
                
                const field = me._context.fields.tryMoveToFieldAtPoint(
                    me._context.status.player,
                    me._context.status.pieceIndicies[me._context.status.player],
                    point);

                if (!field)
                    return;

                if (field.index != me._context.status.targetPieceIndex)
                    return;

                hand.tryMakeAction(
                    field.position,
                    Enums.HandAction.DROP_PIECE,
                    null,
                    () => { me._onPieceDrop(field)}
                );

                break;
            }

            case Enums.GameState.PIECE_ON_FREE_PROPERTY: {

                if (me._tryManageMoney(point))
                    return;

                if (player.canClickButton(point, Enums.ActionType.NEXT_TURN))
                    return me._finishTurn();

                if (!player.canClickButton(point, Enums.ActionType.BUY_FIELD))
                    return;

                hand.tryMakeAction(
                    point,
                    Enums.HandAction.CLICK_BUTTON,
                    null,
                    () => {
                        const handMoney = hand.getTotalMoney();
                        hand.dropMoney();
                        const diff = me._context.status.updatePayAmount(handMoney);

                        if (diff > 0)
                            return;

                        const field = me._context.status.targetPieceIndex;

                        me._buyField(field, player.index);
                        me._updateRent(player.index);
                        me._addMoney(-diff, point, player);

                        me._context.status.buyHouseOnCurrentTurn = true;

                        me._setState(Enums.GameState.FINAL);
                    }
                );
                break;
            }

            case Enums.GameState.PIECE_ON_ENEMY_PROPERTY: {

                if (me._tryManageMoney(point))
                    return;
                
                /** @type {Player} */
                const enemy = Utils.single(me._context.players, (p) => p.hasField(me._context.status.targetPieceIndex));
                if (!me._hands[enemy.index].isClick(point))
                    return;

                hand.tryMakeAction(
                    point,
                    Enums.HandAction.CLICK_BUTTON,
                    null,
                    () => {
                        const total = hand.getTotalMoney();
                        hand.dropMoney();

                        const change = me._context.status.updatePayAmount(total);
                        if (change > 0)
                            return;

                        me._addMoney(-change, point, player);

                        const rent = enemy.getRent(me._context.status.targetPieceIndex);
                        me._addMoney(rent, point, enemy);

                        me._hands[enemy.index].toWait();

                        me._setState(Enums.GameState.FINAL);
                    }
                );

                break;
            }

            case Enums.GameState.OWN_FIELD_SELECTED: {

                const sellField = player.canClickButton(point, Enums.ActionType.SELL_FIELD);
                const sellHouse = player.canClickButton(point, Enums.ActionType.SELL_HOUSE);

                if (sellField || sellHouse) {
                    return hand.tryMakeAction(
                        point,
                        Enums.HandAction.CLICK_BUTTON,
                        null,
                        () => {
                            const index = me._context.status.selectedField;
                            const cost = player.trySell(index, me._context.fields.getFieldPosition(index));
                            if (cost == null)
                                return;
                        
                            player.showButtons([]);

                            me._updateRent(player.index);
                            if (sellField) {
                                me._context.fields.sellField(index);
                                me._cards.sell(index, player.index, player.getCardGrid());
                            }

                            me._addMoney(cost, point, player);

                            Utils.debugLog(`SELL: ${Utils.enumToString(Enums.Player, player.index)} => ${index}`);
                            return me._setState(me._context.status.stateToReturn);
                        });
                }
                
                if (me._tryManageMoney(point))
                    return;

                if (!player.canClickButton(point, Enums.ActionType.BUY_HOUSE))
                    return;

                hand.tryMakeAction(
                    point,
                    Enums.HandAction.CLICK_BUTTON,
                    null,
                    () => {
                        const field = Config.Fields[me._context.status.selectedField];

                        if (me._context.status.stateToReturn == Enums.GameState.PIECE_ON_FREE_PROPERTY) {
                            me._context.status.stateToReturn = Enums.GameState.FINAL;
                            me._context.status.payAmount = 0;
                        }

                        if (me._context.status.payAmount == 0) {
                            me._context.status.setPayAmount(field.costHouse);
                        }

                        const handMoney = hand.getTotalMoney();
                        hand.dropMoney();
                        const diff = me._context.status.updatePayAmount(handMoney);
                        if (diff > 0)
                            return;

                        const fieldIndex = me._context.status.selectedField;
                        player.addHouse(fieldIndex, me._context.fields.getFieldPosition(fieldIndex));
                        me._updateRent(player.index);
                        me._addMoney(-diff, point, player);

                        me._context.status.buyHouseOnCurrentTurn = true;
                        me._setState(me._context.status.stateToReturn);
                });

                break;
            }

            case Enums.GameState.FINAL: {

                if (player.canClickButton(point, Enums.ActionType.NEXT_TURN))
                    return me._finishTurn();

                if (me._tryManageMoney(point))
                    return;

                break;
            }

            default: 
                throw `can't process state: ${Utils.enumToString(Enums.GameState, me._context.status.state)}`;
        }
    }

    _tryManageMoney(point) {
        const me = this;

        const current = me._getCurrentPlayer();
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
                    const money = current.hand.dropMoney();
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
                    const money = current.hand.dropMoney();
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
        me._context.status.targetPieceIndex = (current + first + second) % Consts.FieldCount;
        me._context.status.diceResult = first + second;

        for (let i = 0; i < Config.Start.PlayerCount; ++i)
            me._updateRent(i);

        me._setState(Enums.GameState.DICES_DROPED);
    }

    _cancelTurn() {
        const me = this;

        const current = me._getCurrentPlayer();
        const money = current.hand.dropMoney();
        me._addBills(money, current.hand.toPoint(), current.player);

        current.player.showButtons([]);

        me._context.status.selectedField = null;
        const next = me._getNextStateAfterCancel();

        me._context.status.isBusy = true;
        current.hand.cancel(() => {
            me._context.status.isBusy = false;
            me._setState(next);
        });
    }

    _getNextStateAfterCancel() {
        const me = this;

        switch (me._context.status.state) {
            case Enums.GameState.FIRST_DICE_TAKED:
            case Enums.GameState.SECOND_DICE_TAKED:
                return Enums.GameState.BEGIN;

            case Enums.GameState.PIECE_TAKED:
                return Enums.GameState.DICES_DROPED;

            case Enums.GameState.OWN_FIELD_SELECTED:
                return me._context.status.stateToReturn;
            
            default:
                return me._context.status.state;
        }
    }

    _finishTurn() {
        const me = this;

        me._getCurrentPlayer().hand.toWait();
        me._context.status.player = me._context.status.getNextPlayerIndex();
        me._hud.select(me._context.status.player);
        if (me._context.status.player != Enums.Player.HUMAN)
            me._ai[me._context.status.player].resetState();
        
        for (let i = 0; i < me._context.players.length; ++i)
            me._context.players[i].showButtons(i == me._context.status.player);

        me._context.status.reset();
        me._turnTimer.reset();
        me._setState(Enums.GameState.BEGIN);
    }

    _getCurrentPlayer() {
        const me = this;

        const current = me._context.status.player;
        return {
           player: me._context.players[current],
           hand: me._hands[current],
           ai: me._ai[current]
        };
    }

    _killPlayer() {
        const me = this;

        if (me._context.status.player == Enums.Player.HUMAN) {
            throw 'YOU LOSE!';
        }

        me._context.status.activePlayers = me._context.status.activePlayers.filter((p) => p != me._context.status.player);

        if (me._context.status.activePlayers.length == 1) {
            throw 'YOU WIN!!!'
        }        

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

        if (!Utils.contains(Consts.BuyableFieldTypes, Config.Fields[field].type))
            return false;

        const current = me._getCurrentPlayer();
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

        const player = me._getCurrentPlayer().player;

        switch (state) {
            case Enums.GameState.BEGIN:
                player.showButtons([]);
                break;

            case Enums.GameState.FINAL:
                player.showButtons([ Enums.ActionType.NEXT_TURN ]);
                break;

            case Enums.GameState.PIECE_ON_FREE_PROPERTY:
                player.showButtons([Enums.ActionType.BUY_FIELD, Enums.ActionType.NEXT_TURN]);
                break;    
        }

        me._context.status.setState(state);
        me._restoreSelection();
    }

    _createCursor(scene) {
        const me = this;

        const cursor = scene.physics.add.image(
            Config.Start.CameraPosition.x, 
            Config.Start.CameraPosition.y, 
            'cursor')
            .setDepth(Consts.Depth.Max)
            .setVisible(false)
            .setCollideWorldBounds(true);

        return cursor;
    }

    _getCursorOffset() {
        const me = this;

        return Utils.buildPoint(
            me._cursor.x + 100,
            me._cursor.y + 200);
    }

    _onPieceDrop(field) {
        const me = this;

        const current = me._getCurrentPlayer(); 
        me._context.status.pieceIndicies[me._context.status.player] = me._context.status.targetPieceIndex;

        const fieldConfig = Config.Fields[field.index];

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

            me._hands[enemyIndex].prepareToRent();
            
            return me._setState(Enums.GameState.PIECE_ON_ENEMY_PROPERTY);
        }

        const canBuyField = me._isHumanTurn() || current.ai.canBuyField(field.index);

        if (!current.player.hasField(field.index) && canBuyField) {
            me._context.status.setPayAmount(fieldConfig.cost);
            return me._setState(Enums.GameState.PIECE_ON_FREE_PROPERTY);
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

        const billIndicies = Helper.enumBills(bills);

        const billsValue = Helper.getTotalMoney(bills);

        me._hud.updateMoney(
            player.index, 
            player.getBillsMoney() + billsValue,
            player.getFieldsCost())

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
                    Consts.Speed.CardEntranceDuration),
                delay: i * 50,
                onComplete: () => {
                    player.addBill(billIndicies[i])
                    me._groups.killBill(bill);
                }
            });
        }
    }

    _pause() {
        const me = this;

        me._scene.input.mouse.releasePointerLock();
        me._scene.tweens.pauseAll();
        me._turnTimer.pause();
        me._context.status.isPause = true;
        me._fade.setVisible(true);
    }

    _unpause() {
        const me = this;

        me._scene.tweens.resumeAll();
        me._context.status.isPause = false;
        me._turnTimer.resume();
        me._restoreSelection();
        me._fade.setVisible(false);
    }

    _restoreSelection() {
        const me = this;

        const isHuman = me._isHumanTurn();
        if (!isHuman) {
            me._context.dice1.unselect();
            me._context.dice2.unselect();
            me._context.pieces[Enums.Player.HUMAN].unselect();
            me._context.fields.unselect();
            return;
        }

        switch (me._context.status.state) {
            case Enums.GameState.BEGIN:
                me._context.dice1.select();
                me._context.dice2.select();
                break;

            case Enums.GameState.SECOND_DICE_TAKED:
                me._context.dice1.unselect();
                me._context.dice2.unselect();

                break;

            case Enums.GameState.DICES_DROPED:
                me._context.pieces[Enums.Player.HUMAN].select();

                break;

            case Enums.GameState.PIECE_TAKED:
                me._context.pieces[Enums.Player.HUMAN].unselect();
                me._context.fields.select(me._context.status.targetPieceIndex);
                break;

            case Enums.GameState.PIECE_ON_ENEMY_PROPERTY:
            case Enums.GameState.PIECE_ON_FREE_PROPERTY:
            case Enums.GameState.FINAL:
                me._context.fields.unselect();
            break;
        }
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
}