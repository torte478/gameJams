import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import FieldInfo from '../FieldInfo.js';
import Helper from '../Helper.js';
import Utils from '../Utils.js';

export default class Field {

    // TODO : to independent class (and everywhere)
    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Number[]} */
    _pieces;

    /** @type {Number} */
    _index;

    // TODO : to independent class (and everywhere)
    /** @type {Phaser.GameObjects.Image} */
    _selection;

    /** @type {Phaser.Tweens.Tween} */
    _selectionTween;

    /** @type {Object} */
    _rentBlock = {
        /** @type {Phaser.GameObjects.Text} */
        cost: null,
        /** @type {Phaser.GameObjects.Image} */
        icon: null,
        /** @type {Phaser.GameObjects.Image} */
        rect: null,
    }

    /** @type {Number} */
    _player;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {String} texture 
     * @param {Number} angle 
     * @param {Number} index 
     */
    constructor(scene, x, y, texture, angle, index) {
        const me = this;

        const config = FieldInfo.Config[index],
              content = me._initFieldContent(scene.add, config);

        me._selection = scene.add.image(0, 0, texture, 2).setVisible(false);

        me._selectionTween = scene.tweens.add({
            targets: me._selection,
            scaleX: { from: 1.1, to: 1.25 },
            scaleY: { from: 1.2, to: 1.4 },
            duration: Consts.Speed.Selection,
            yoyo: true,
            repeat: -1
        });

        const children = [ 
            me._selection,
            scene.add.image(0, 0, texture, 0) 
            ]
            .concat(content);

        me._container = scene.add.container(x, y, children)
            .setAngle(angle);
        me._index = index;
        
        me._pieces = [];
        for (let i = 0; i < Config.PlayerCount; ++i) {
            me._pieces.push(Enums.Player.NOONE)
        }

        me._player = Enums.Player.NOONE;
    }

    /**
     * @returns {Phaser.Geom.Rectangle}
     */
    getBounds() {
        const me = this;

        return me._container.getBounds();
    }

    /**
     * @returns {Phaser.GameObjects.GameObject}
     */
    toGameObject() {
        const me = this;

        return me._container;
    }

    /**
     * @param {Number} player 
     */
    removePiece(player) {
        const me = this;

        for (let i = 0; i < me._pieces.length; ++i) {
            if (me._pieces[i] == player)
                me._pieces[i] = Enums.Player.NOONE
        }
    }

    /**
     * @param {Number} player 
     */
    addPiece(player) {
        const me = this;

        for (let position = 0; position < me._pieces.length; ++position) {

            if (me._pieces[position] == Enums.Player.NOONE) {
                me._pieces[position] = player;
                return position;
            }
        }

        throw `can't find free space for player: ${player}`;
    }

    /**
     * @param {Number} player 
     */
    buy(player) {
        const me = this;

        me._player = player;

        me._rentBlock.rect
            .setFrame(player == Enums.Player.HUMAN ? 9 : 10)
            .setVisible(true);

        me._rentBlock.icon
            .setFrame(player * 2)
            .setVisible(true);

        me._rentBlock.cost
            .setVisible(true);
    }

    /**
     * @param {Number} rent 
     */
    updateRent(rent) {
        const me = this;

        const text = `${me._player == Enums.Player.HUMAN ? '+' : '-'} ${rent}`;
        me._rentBlock.cost.setText(text);
    }

    /**
     */
    sell() {
        const me = this;

        me._player = Enums.Player.NOONE;

        me._rentBlock.rect.setVisible(false);
        me._rentBlock.cost.setVisible(false);
        me._rentBlock.icon.setVisible(false);
    }

    /**
     */
    select() {
        const me = this;

        const buyed = Utils.contains(Consts.BuyableFieldTypes, FieldInfo.Config[me._index].type)
                      &&  me._rentBlock.rect.visible;

        me._selection
            .setVisible(true)
            .setPosition(0, buyed ? 25 : 0);

        me._selectionTween.resume();
        me._container.setDepth(Consts.Depth.SelectedField);
    }

    /**
     */
    unselect() {
        const me = this;

        me._selection.setVisible(false);
        me._container.setDepth(Consts.Depth.Board);
        me._selectionTween.pause();
    }

    /**
     */
    startDark() {
        const me = this;

        const config = FieldInfo.Config[me._index];
        const items = me._container.getAll();
        me.unselect();

        items[1].setFrame(1);

        switch (config.type) {
            case Enums.FieldType.PROPERTY:
                items[2].setFrame(0);
                Helper.toDark(items[3]);
                items[4].setStyle(Consts.TextStyle.FieldSmallDark);
                items[5].setStyle(Consts.TextStyle.FieldMiddleDark);
                items[6].setFrame(0);
                Helper.toDark(items[7]);
                items[8].setStyle(Consts.TextStyle.FieldMiddleDark);
                break;

            case Enums.FieldType.CHANCE:
                Helper.toDark(items[2]);
                items[3].setStyle(Consts.TextStyle.FieldBigDark);
                break;

            case Enums.FieldType.TAX:
                Helper.toDark(items[2]);
                items[3].setStyle(Consts.TextStyle.FieldBigDark);
                items[4].setStyle(Consts.TextStyle.FieldMiddleDark);
                break;
            
            case Enums.FieldType.RAILSTATION:
                Helper.toDark(items[2]);
                items[3].setStyle(Consts.TextStyle.FieldMiddleDark);
                items[4].setStyle(Consts.TextStyle.FieldMiddleDark);
                items[5].setFrame(0);
                Helper.toDark(items[6]);
                items[7].setStyle(Consts.TextStyle.FieldMiddleDark);
                break;
            
            case Enums.FieldType.UTILITY:
                Helper.toDark(items[2]);
                items[3].setStyle(Consts.TextStyle.FieldSmallDark);
                items[4].setStyle(Consts.TextStyle.FieldMiddleDark);
                items[5].setFrame(0);
                Helper.toDark(items[6]);
                items[7].setStyle(Consts.TextStyle.FieldMiddleDark);
                break;

            case Enums.FieldType.START:
            case Enums.FieldType.FREE:
            case Enums.FieldType.GOTOJAIL:
            case Enums.FieldType.JAIL:
                Helper.toDark(items[2]);
                break;

            default:
                throw `Unknown field type ${config.type}`;
        }
    }

    /**
     */
    stopDark() {
        const me = this;

        const config = FieldInfo.Config[me._index];
        const items = me._container.getAll();

        items[1].setFrame(0);

        switch (config.type) {
            case Enums.FieldType.PROPERTY:
                items[2].setFrame(config.color);
                Helper.toLight(items[3]);
                items[4].setStyle(Consts.TextStyle.FieldSmallLight);
                items[5].setStyle(Consts.TextStyle.FieldMiddleLight);
                items[6].setFrame(me._player == Enums.Player.HUMAN ? 9 : 1);
                Helper.toLight(items[7]);
                items[8].setStyle(Consts.TextStyle.FieldMiddleLight);
                break;

            case Enums.FieldType.CHANCE:
                Helper.toLight(items[2]);
                items[3].setStyle(Consts.TextStyle.FieldBigLight);
                break;

            case Enums.FieldType.TAX:
                Helper.toLight(items[2]);
                items[3].setStyle(Consts.TextStyle.FieldBigLight);
                items[4].setStyle(Consts.TextStyle.FieldMiddleLight);
                break;
            
            case Enums.FieldType.RAILSTATION:
                Helper.toLight(items[2]);
                items[3].setStyle(Consts.TextStyle.FieldMiddleLight);
                items[4].setStyle(Consts.TextStyle.FieldMiddleLight);
                items[5].setFrame(me._player == Enums.Player.HUMAN ? 9 : 1);
                Helper.toLight(items[6]);
                items[7].setStyle(Consts.TextStyle.FieldMiddleLight);
                break;
            
            case Enums.FieldType.UTILITY:
                Helper.toLight(items[2]);
                items[3].setStyle(Consts.TextStyle.FieldSmallLight);
                items[4].setStyle(Consts.TextStyle.FieldMiddleLight);
                items[5].setFrame(me._player == Enums.Player.HUMAN ? 9 : 1);
                Helper.toLight(items[6]);
                items[7].setStyle(Consts.TextStyle.FieldMiddleLight);
                break;

            case Enums.FieldType.START:
            case Enums.FieldType.FREE:
            case Enums.FieldType.GOTOJAIL:
            case Enums.FieldType.JAIL:
                Helper.toLight(items[2]);
                break;

            default:
                throw `Unknown field type ${config.type}`;
        }
    }

     /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     * @param {Object} config 
     * @returns {Phaser.GameObjects.GameObject[]}
     */
    _initFieldContent(factory, config) {
        const me = this;

        me._initRentBlock(factory, config.type);

        switch (config.type) {
            case Enums.FieldType.PROPERTY:
                return [
                    factory.image(0, -95, 'field_header', config.color),
                    factory.image(0, 20, 'icons', config.icon),
                    factory.text(0, -40, config.name, Consts.TextStyle.FieldSmallLight).setOrigin(0.5),
                    factory.text(0, 95, config.cost, Consts.TextStyle.FieldMiddleLight).setOrigin(0.5),
                    me._rentBlock.rect,
                    me._rentBlock.icon,
                    me._rentBlock.cost
                ];

            case Enums.FieldType.CHANCE:
                return [
                    factory.image(0, 20, 'icons_big', 0),
                    factory.text(0, -90, 'CHANCE', Consts.TextStyle.FieldBigLight).setOrigin(0.5)
                ];

            case Enums.FieldType.TAX:
                return [
                    factory.image(0, 0, 'icons_big', 2),
                    factory.text(0, -90, 'TAX', Consts.TextStyle.FieldBigLight).setOrigin(0.5),
                    factory.text(0, 95, `PAY ${config.cost}`, Consts.TextStyle.FieldMiddleLight).setOrigin(0.5),
                ];

            case Enums.FieldType.RAILSTATION:
                return [
                    factory.image(0, 0, 'icons_big', 4),
                    factory.text(0, -90, config.name, Consts.TextStyle.FieldMiddleLight).setOrigin(0.5),
                    factory.text(0, 95, config.cost, Consts.TextStyle.FieldMiddleLight).setOrigin(0.5),
                    me._rentBlock.rect,
                    me._rentBlock.icon,
                    me._rentBlock.cost
                ];

            case Enums.FieldType.UTILITY:
                return [
                    factory.image(0, 0, 'icons_big', config.icon),
                    factory.text(0, -90, config.name, Consts.TextStyle.FieldSmallLight).setOrigin(0.5),
                    factory.text(0, 95, config.cost, Consts.TextStyle.FieldMiddleLight).setOrigin(0.5),
                    me._rentBlock.rect,
                    me._rentBlock.icon,
                    me._rentBlock.cost
                ];

            case Enums.FieldType.START:
                return [
                    factory.image(0, 0, 'icons_corner', 0)
                ];

            case Enums.FieldType.JAIL:
                return [
                    factory.image(0, 0, 'icons_corner', 2)
                ];

            case Enums.FieldType.FREE:
                return [
                    factory.image(0, 0, 'icons_corner', 4)
                ];

            case Enums.FieldType.GOTOJAIL:
                return [
                    factory.image(0, 0, 'icons_corner', 6)
                ];

            default:
                throw `Unknown field type ${config.type}`;
        }
    }

    _initRentBlock(factory, type) {
        const me = this;

        const hasRent = Utils.contains(Consts.BuyableFieldTypes, type);
        if (!hasRent)
            return;

        me._rentBlock.rect = factory.image(0, 144, 'field_header', 9).setVisible(false);
        me._rentBlock.icon = factory.image(-50, 144, 'pieces', 0).setScale(0.5).setVisible(false);
        me._rentBlock.cost = factory.text(20, 144, 'RENT', Consts.TextStyle.FieldMiddleLight).setOrigin(0.5).setVisible(false);
    }
}