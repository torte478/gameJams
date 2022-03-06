import Phaser from '../lib/phaser.js';

import Player from './Entities/Player.js';
import Fields from './Entities/Fields.js';
import Cards from './Entities/Cards.js';
import Groups from './Entities/Groups.js'; 
import Hand from './Entities/Hand.js';
import HUD from './Entities/HUD.js';

import Config from './Config.js';
import Consts from './/Consts.js';
import Enums from './/Enums.js';
import Status from './Status.js';
import Utils from './Utils.js';
import Helper from './Helper.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Fields} */
    _fields;

    /** @type {Phaser.GameObjects.Image[]} */
    _pieces;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _dice1;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _dice2;

    /** @type {Hand} */
    _hand;

    /** @type {Hand[]} */
    _hands;

    /** @type {Status} */
    _status;

    /** @type {Player[]} */
    _players;

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

        const factory = scene.add;

        me._cursor = me._createCursor(scene);

        me._status = new Status(Config.Start.PiecePositions, Config.Start.Player, Config.Start.State);

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

        me._fields = new Fields(factory, Config.Start.PiecePositions);

        me._pieces = [];
        for (let player = 0; player < Config.Start.PlayerCount; ++player) {
            const position = me._fields.movePiece(player, 0, Config.Start.PiecePositions[player]);

            const piece = factory.image(position.x, position.y, 'pieces', player * 2)
                .setDepth(Consts.Depth.Pieces);

            me._pieces.push(piece);
        }

        me._dice1 = scene.physics.add.sprite(0, 0, 'dice', 2)
            .setDepth(Consts.Depth.Pieces)
            .setBounce(1, 1)
            .setCollideWorldBounds(true);
        me._dice1.body.setBoundsRectangle(new Phaser.Geom.Rectangle(-700, -700, 1400, 1400));


        me._dice2 = scene.physics.add.sprite(
            Consts.SecondDiceOffset.X, 
            Consts.SecondDiceOffset.Y,
            'dice', 
            6)
            .setDepth(Consts.Depth.Pieces)
            .setBounce(1, 1)
            .setCollideWorldBounds(true);
        me._dice2.body.setBoundsRectangle(new Phaser.Geom.Rectangle(-700, -700, 1400, 1400));;

        scene.physics.add.collider(me._dice1, me._dice2);

        me._hands = [];
        for (let i = 0; i < Config.Start.PlayerCount; ++i)
            me._hands.push(new Hand(scene, i));

        me._groups = new Groups(scene);
        me._cards = new Cards(scene);

        me._players = [];
        for (let i = 0; i < Config.Start.PlayerCount; ++ i) {
            const player = new Player(scene, i, Config.Start.Money, me._groups);
            me._players.push(player);

            for (let j = 0; j < Config.Start.Fields[i].length; ++j)
                me._buyField(Config.Start.Fields[i][j], i, true);

            if (Config.Start.Fields[i].length > 0)
                me._updateRent(i);
        }

        me._hud = new HUD(factory);

        for (let i = 0; i < me._players.length; ++i)
            me._hud.updateMoney(
                i, 
                me._players[i].getBillsMoney(),
                me._players[i].getFieldsCost());

        me._setState(Config.Start.State);

        // Debug

        if (Config.Debug.Global) {
            me._log = scene.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        }
    }

    update(delta) {
        const me = this;

        if (!me._isHumanTurn()) {
            me._processCpuTurn();
        }

        const target = me._getCursorOffset();
        me._getCurrentPlayer().hand.moveTo(target, delta);

        if (Config.Debug.Global) {
            me._log.text = 
            `ptr: ${me._cursor.x | 0} ${me._cursor.y | 0}\n` + 
            `mse: ${me._scene.input.activePointer.worldX} ${me._scene.input.activePointer.worldY}`;
        }
    }

    onPointerMove(pointer) {
        const me = this;

        if (!me._scene.input.mouse.locked) 
                return;

        me._cursor.x += pointer.movementX;
        me._cursor.y += pointer.movementY;

        const point = Utils.toPoint(me._cursor);

        let index = me._fields.getFieldIndex(point);
        if (index == null)
            index = me._cards.getFieldIndex(point);

        index != null
            ? me._hud.showField(index)
            : me._hud.hideField();

        me._players.forEach(
            (p) => p.updateButtonSelection(point));
    }

    onPointerDown(pointer) {
        const me = this;

        if (me._scene.input.mouse.locked) {
            const point = Utils.toPoint(me._cursor);
            me.processHumanTurn(point, pointer.rightButtonDown());
        }
        else {
            me._scene.input.mouse.requestPointerLock();
            me._cursor.setVisible(true);

            me._scene.cameras.main.startFollow(me._cursor, true, 0.05, 0.05);    
        }
    }
    
    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Boolean} isRightButton 
     */
    processHumanTurn(point, isRightButton) {
        const me = this;

        if (!me._isHumanTurn())
            return;

        me._processTurn(point, isRightButton);
    }

    debugDropDices(value) {
        const me = this;

        if (me._status.state == Enums.GameState.BEGIN) {
            Utils.debugLog(`debug drop: ${value}`);
            me._applyDiceDrop(value, 0);
        }
    }

    updateHud(deltaY) {
        const me = this;

        if (deltaY > 0)
            me._hud.show();
        else if (deltaY < 0)
            me._hud.hide();
    }

    _processCpuTurn() {
        const me = this;

        const point = me._getCpuPoint();

        if (point != null)
            me._processTurn(point, false);
    }

    _isHumanTurn() {
        const me = this;

        return me._status.player == Enums.PlayerIndex.HUMAN;
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

        if (hand.isBusy() || me._status.isBusy)
            return;

        if (isCancel)
            return me._cancelTurn();

        if (me._trySelectOwnField(point))
            return;

        if (Utils.contains(Consts.States.SellField, me._status.state) && me._trySelectOwnField(point)) {
                return me._setState(Enums.GameState.OWN_FIELD_SELECTED);
        }

        switch (me._status.state) {
            case Enums.GameState.BEGIN: {

                let canTakeDice = hand.tryMakeAction(
                    point,
                    Enums.HandAction.TAKE_DICE,
                    {
                        image: me._dice1,
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
                        image: me._dice2,
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
                        image: me._dice1,
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
                        image: me._dice2,
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

                        me._dice1
                            .play('first_dice_roll')
                            .setVelocity(
                                Utils.getRandom(-Consts.DicePhysics.Speed, Consts.DicePhysics.Speed, 0),
                                Utils.getRandom(-Consts.DicePhysics.Speed, Consts.DicePhysics.Speed, 0))
                            .setAngularVelocity(
                                Utils.getRandom(-Consts.DicePhysics.Angle, -Consts.DicePhysics.Angle, 10));

                        me._dice2
                            .play('second_dice_roll')
                            .setVelocity(
                                Utils.getRandom(-Consts.DicePhysics.Speed, Consts.DicePhysics.Speed, 0),
                                Utils.getRandom(-Consts.DicePhysics.Speed, Consts.DicePhysics.Speed, 0))
                            .setAngularVelocity(
                                Utils.getRandom(-Consts.DicePhysics.Angle, -Consts.DicePhysics.Angle, 10));

                        me._status.isBusy = true;

                        me._scene.time.delayedCall(
                            Utils.getRandom(1000, 2000, 1000),
                            () => {
                                me._dice1.stop().setFrame(first).setVelocity(0).setAngularVelocity(0);
                                me._dice2.stop().setFrame(second).setVelocity(0).setAngularVelocity(0);

                                Utils.debugLog(`${first} ${second} (${first + second})`);

                                me._status.isBusy = false;
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
                        image: me._pieces[me._status.player],
                        type: Enums.HandState.PIECE,
                    },
                    () => { me._setState(Enums.GameState.PIECE_TAKED) });

                break;
            }

            case Enums.GameState.PIECE_TAKED: {
                
                const field = me._fields.tryMoveToFieldAtPoint(
                    me._status.player,
                    me._status.pieceIndicies[me._status.player],
                    point);

                if (!field)
                    return;

                if (field.index != me._status.targetPieceIndex)
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
                        const diff = me._status.updatePayAmount(handMoney);

                        if (diff > 0)
                            return;

                        const field = me._status.targetPieceIndex;

                        me._buyField(field, player.index);
                        me._updateRent(player.index);
                        me._addMoney(-diff, point, player);

                        me._status.buyHouseOnCurrentTurn = true;

                        me._setState(Enums.GameState.FINAL);
                    }
                );
                break;
            }

            case Enums.GameState.PIECE_ON_ENEMY_PROPERTY: {

                if (me._tryManageMoney(point))
                    return;
                
                /** @type {Player} */
                const enemy = Utils.single(me._players, (p) => p.hasField(me._status.targetPieceIndex));
                if (!me._hands[enemy.index].isClick(point))
                    return;

                hand.tryMakeAction(
                    point,
                    Enums.HandAction.CLICK_BUTTON,
                    null,
                    () => {
                        const total = hand.getTotalMoney();
                        hand.dropMoney();

                        const change = me._status.updatePayAmount(total);
                        if (change > 0)
                            return;

                        me._addMoney(-change, point, player);

                        const rent = enemy.getRent(me._status.targetPieceIndex);
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
                            const index = me._status.selectedField;
                            const cost = player.trySell(index, me._fields.getFieldPosition(index));
                            if (cost == null)
                                return;
                        
                            player.showButtons([]);

                            me._updateRent(player.index);
                            if (sellField) {
                                me._fields.sellField(index);
                                me._cards.sell(index, player.index, player.getCardGrid());
                            }

                            me._addMoney(cost, point, player);

                            Utils.debugLog(`SELL: ${Utils.enumToString(Enums.PlayerIndex, player.index)} => ${index}`);
                            return me._setState(me._status.stateToReturn);
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
                        const field = Config.Fields[me._status.selectedField];

                        if (me._status.stateToReturn == Enums.GameState.PIECE_ON_FREE_PROPERTY) {
                            me._status.stateToReturn = Enums.GameState.FINAL;
                            me._status.payAmount = 0;
                        }

                        if (me._status.payAmount == 0) {
                            me._status.setPayAmount(field.costHouse);
                        }

                        const handMoney = hand.getTotalMoney();
                        hand.dropMoney();
                        const diff = me._status.updatePayAmount(handMoney);
                        if (diff > 0)
                            return;

                        const fieldIndex = me._status.selectedField;
                        player.addHouse(fieldIndex, me._fields.getFieldPosition(fieldIndex));
                        me._updateRent(player.index);
                        me._addMoney(-diff, point, player);

                        me._status.buyHouseOnCurrentTurn = true;
                        me._setState(me._status.stateToReturn);
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
                throw `can't process state: ${Utils.enumToString(Enums.GameState, me._status.state)}`;
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

    _getCpuPoint() {
        const me = this;

        if (me._status.isBusy)
            return null;

        const current = me._getCurrentPlayer();

        switch (me._status.state) {
            case Enums.GameState.BEGIN:
                return Utils.toPoint(me._dice1)

            case Enums.GameState.FIRST_DICE_TAKED:
                return Utils.toPoint(me._dice2);

            case Enums.GameState.SECOND_DICE_TAKED: {

                if (me._status.isBusy)
                    return null;

                const zone = Consts.DiceZoneRect;

                const playerIndex = me._getNextPlayerIndex() != Enums.PlayerIndex.HUMAN
                    ? me._status.player
                    : Enums.PlayerIndex.HUMAN;

                const humanPos = Utils.toPoint(me._pieces[playerIndex]);

                const randomPos = Utils.buildPoint(
                    humanPos.x + Utils.getRandom(-200, 200, 0),
                    humanPos.y + Utils.getRandom(-200, 200, 0));

                const target = Utils.buildPoint(
                    Math.max(zone.x, Math.min(zone.x + zone.width, randomPos.x)),
                    Math.max(zone.y, Math.min(zone.y + zone.height, randomPos.y)));

                return target;
            }

            case Enums.GameState.DICES_DROPED:
                return Utils.toPoint(me._pieces[me._status.player]);

            case Enums.GameState.PIECE_TAKED:
                return me._fields.getFieldPosition(me._status.targetPieceIndex);

            case Enums.GameState.PIECE_ON_FREE_PROPERTY: {
                const cost = Config.Fields[me._status.targetPieceIndex].cost;
                const handMoney = current.hand.getTotalMoney();
                const diff = cost - handMoney;

                return diff > 0
                    ? current.player.getNextOptimalBillPosition(diff)
                    : current.player.getButtonPosition(Enums.ActionType.BUY_FIELD);
            }

            case Enums.GameState.PIECE_ON_ENEMY_PROPERTY: {

                const total = current.player.getBillsMoney() + current.hand.getTotalMoney();
                if (total < me._status.payAmount) {
                    const index = current.player.getRichestField();
                    return me._fields.getFieldPosition(index);
                }
                
                /** @type {Player} */
                const enemy = Utils.single(me._players, (p) => p.hasField(me._status.targetPieceIndex));
                const handMoney = current.hand.getTotalMoney();
                const diff = me._status.payAmount - handMoney;

                return diff > 0
                    ? current.player.getNextOptimalBillPosition(diff)
                    : enemy.getButtonPosition(Enums.ActionType.UNKNOWN);
            }

            case Enums.GameState.OWN_FIELD_SELECTED:  {
                if (me._status.stateToReturn != Enums.GameState.PIECE_ON_ENEMY_PROPERTY)
                    throw `ai on OWN_FIELD_SELECTED from ` + 
                        `${Utils.enumToString(Enums.GameState, me._status.stateToReturn)} not implemented`;

                return current.player.getButtonPosition(Enums.ActionType.SELL_FIELD);
            }
                
            case Enums.GameState.FINAL:
               return current.player.getButtonPosition(Enums.ActionType.NEXT_TURN);

            default:
                const stateStr = Utils.enumToString(Enums.GameState, me._status.state);
                throw `CPU Error! Unknown state ${stateStr}`;
        }
    }

    _applyDiceDrop(first, second) {
        const me = this;

        const current = me._status.pieceIndicies[me._status.player];
        me._status.targetPieceIndex = (current + first + second) % Consts.FieldCount;
        me._status.diceResult = first + second;

        for (let i = 0; i < Config.Start.PlayerCount; ++i)
            me._updateRent(i);

        me._setState(Enums.GameState.DICES_DROPED);
    }

    _cancelTurn() {
        const me = this;

        const current = me._getCurrentPlayer();
        const money = current.hand.dropMoney();
        me._addBills(money, current.hand.toPoint(), current.player);
        current.hand.cancel();

        current.player.showButtons([]);

        me._status.selectedField = null;
        const next = me._getNextStateAfterCancel();
        me._setState(next);
    }

    _getNextStateAfterCancel() {
        const me = this;

        switch (me._status.state) {
            case Enums.GameState.FIRST_DICE_TAKED:
            case Enums.GameState.SECOND_DICE_TAKED:
                return Enums.GameState.BEGIN;

            case Enums.GameState.PIECE_TAKED:
                return Enums.GameState.DICES_DROPED;

            case Enums.GameState.OWN_FIELD_SELECTED:
                return me._status.stateToReturn;
            
            default:
                return me._status.state;
        }
    }

    _finishTurn() {
        const me = this;

        me._getCurrentPlayer().hand.toWait();
        me._status.player = me._getNextPlayerIndex();
        
        for (let i = 0; i < me._players.length; ++i)
            me._players[i].showButtons(i == me._status.player);

        me._status.reset();
        me._setState(Enums.GameState.BEGIN);
    }

    _getNextPlayerIndex() {
        const me = this;

        let result = me._status.player;
        do {
            result = (result + 1) % Config.Start.PlayerCount;
        } while (Utils.all(me._status.activePlayers, (p) => p != result));

        return result;
    }

    _getCurrentPlayer() {
        const me = this;

        return {
           player: me._players[me._status.player],
           hand: me._hands[me._status.player]
        };
    }

    _killPlayer() {
        const me = this;

        if (me._status.player == Enums.PlayerIndex.HUMAN) {
            throw 'YOU LOSE!';
        }

        me._status.activePlayers = me._status.activePlayers.filter((p) => p != me._status.player);

        if (me._status.activePlayers.length == 1) {
            throw 'YOU WIN!!!'
        }        

        Utils.debugLog(`Player ${Utils.enumToString(Enums.PlayerIndex, me._status.player)} lose!`);

        me._finishTurn();
    }

    _trySelectOwnField(point) {
        const me = this;

        if (!Utils.contains(Consts.States.SellField, me._status.state))
            return false;

        let field = me._fields.getFieldIndex(point);
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
                me._status.selectedField = field;
                me._status.stateToReturn = me._status.state;

                const actions = [];

                const action = current.player.canSellSmth(field);
                if (action != null)
                    actions.push(action);
                
                const canBuyHouse = current.player.canBuyHouse(field)
                                    && !me._status.buyHouseOnCurrentTurn 
                                    && (me._status.state == Enums.GameState.FINAL
                                        || me._status.state == Enums.GameState.PIECE_ON_FREE_PROPERTY);
                if (canBuyHouse) 
                    actions.push(Enums.ActionType.BUY_HOUSE);

                current.player.showButtons(actions);

                Utils.debugLog(`select field ${field}`);
                me._setState(Enums.GameState.OWN_FIELD_SELECTED);
            }
        );

        return true;
    }

    _setState(state) {
        const me = this;

        const player = me._getCurrentPlayer().player;

        if (state == Enums.GameState.BEGIN)
            player.showButtons([]);
        else if (state == Enums.GameState.FINAL)
            player.showButtons([ Enums.ActionType.NEXT_TURN ]);
        else if (state == Enums.GameState.PIECE_ON_FREE_PROPERTY)
            player.showButtons([Enums.ActionType.BUY_FIELD, Enums.ActionType.NEXT_TURN]);

        me._status.setState(state);
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
        me._status.pieceIndicies[me._status.player] = me._status.targetPieceIndex;

        const fieldConfig = Config.Fields[field.index];

        if (fieldConfig.type == Enums.FieldType.GOTOJAIL) {
            const jail = me._fields.movePiece(
                me._status.player, 
                field.index, 
                Consts.JailFieldIndex, 
                true);
            me._status.pieceIndicies[me._status.player] = Consts.JailFieldIndex;

            me._status.isBusy = true;
            return me._scene.tweens.add({
                targets: me._pieces[me._status.player],
                x: jail.x,
                y: jail.y,
                ease: 'Sine.easeInOut',
                duration: Utils.calclTweenDuration(
                    Utils.toPoint(me._pieces[me._status.player]),
                    jail,
                    Consts.Speed.HandAction
                ),
                onComplete: () => { 
                    me._status.isBusy = false;
                    me._finishTurn();
                }
            });
        }

        if (!Utils.contains(Consts.BuyableFieldTypes, fieldConfig.type))
            return me._setState(Enums.GameState.FINAL);
            
        const enemyIndex = Utils.firstOrDefaultIndex(
            me._players, 
            (p) => p.index != me._status.player && p.hasField(field.index));

        if (enemyIndex != null) {
            const rent = me._players[enemyIndex].getRent(field.index, me._status.diceResult);
            
            if (rent > current.player.getTotalMoney())
                return me._killPlayer();

            me._status.setPayAmount(rent);

            me._hands[enemyIndex].prepareToRent();
            
            return me._setState(Enums.GameState.PIECE_ON_ENEMY_PROPERTY);
        }

        const canBuyProperty = fieldConfig.cost <= current.player.getBillsMoney();

        if (!current.player.hasField(field.index) && canBuyProperty) {
            me._status.setPayAmount(fieldConfig.cost);
            return me._setState(Enums.GameState.PIECE_ON_FREE_PROPERTY);
        }

        return me._setState(Enums.GameState.FINAL)
    }

    _updateRent(playerIndex) {
        const me = this;

        const player = me._players[playerIndex];

        for (let i = 0; i < Consts.FieldCount; ++i)
            if (player.hasField(i)) {
                const rent = player.getRent(i, me._status.diceResult);
                me._fields.updateRent(i, playerIndex, rent)
            }      
    }

    _buyField(field, playerIndex, ignoreTween) {
        const me = this;

        const cardGrid = me._players[playerIndex].addField(field);
        me._fields.buyField(field, playerIndex);
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
                duration: Utils.calclTweenDuration(
                    from, 
                    target, 
                    Consts.Speed.CardOuterDuration),
                delay: i * 50,
                onComplete: () => {
                    player.addBill(billIndicies[i])
                    me._groups.killBill(bill);
                }
            });
        }
    }
}