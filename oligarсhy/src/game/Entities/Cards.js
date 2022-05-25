import Phaser from "../../lib/phaser.js";

import Consts from "../Consts.js";
import Enums from "../Enums.js";
import Helper from "../Helper.js";
import Utils from "../Utils.js";
import FieldInfo from '../FieldInfo.js';

export default class Cards {

    /** @type {Phaser.Scene} */
    _scene; // TODO: remove there and everywhere

    /** @type {Object[]} */
    _cards;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor (scene) {
        const me = this;

        me._scene = scene;
        me._cards = me._initCards(scene);
    }

    /**
     * @param {Number} field 
     * @param {Number} player 
     * @param {Number[][]} grid 
     * @param {Boolean} ignoreTween 
     */
    buy(field, player, grid, ignoreTween) {
        const me = this;

        const card = Utils.single(me._cards, (c) => c.index == field);

        if (card.container.visible)
            throw `card ${field} already visible`;

        card.container
            .setVisible(true)
            .setAngle(Helper.getAngle(player));

        me._updateGridForCard(player, grid, field, true, ignoreTween);
    }

    /**
     * @param {Number} field 
     * @param {Number} player 
     * @param {Number[][]} grid 
     */
    sell(field, player, grid) {
        const me = this;

        const card = Utils.single(me._cards, (c) => c.index == field);

        if (!card.container.visible)
            throw `card ${field} already hidden`;

        me._updateGridForCard(player, grid, field, false);
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @returns {Number}
     */
    findFieldIndex(point) {
        const me = this;

        const card =  Utils.firstOrDefault(
            me._cards,
            (c) => c.container.visible
                   && Phaser.Geom.Rectangle.ContainsPoint(
                        c.container.getBounds(),
                        point));

        return card != null
            ? card.index
            : null;
    }

    /**
     * @param {Number[]} fields 
     */
    sellAll(fields) {
        const me = this;

        for (let i = 0; i < fields.length; ++i)
            me._sellCard(fields[i]);
    }

    /**
     */
    startDark() {
        const me = this;

        for (let i = 0; i < me._cards.length; ++i) {
            const card = me._cards[i];
            
            if (!card.container.visible)
                continue;

            me._startCardDark(card);
        }
    }

    /**
     */
    stopDark() {
        const me = this;

        for (let i = 0; i < me._cards.length; ++i) {
            const card = me._cards[i];
            
            if (!card.container.visible)
                continue;

            me._stopCardDark(card);
        }
    }

    _startCardDark(card) {
        const config = FieldInfo.Config[card.index];

        /** @type {Phaser.GameObjects.Container} */
        const container = card.container;
        const items = container.getAll();

        switch (config.type) {
            case Enums.FieldType.PROPERTY:
                Helper.toDark(items[0]);
                items[1].setFrame(0);
                items[2].setStyle(Consts.TextStyle.FieldSmallDark);
                Helper.toDark(items[3]);
                break;

            case Enums.FieldType.RAILSTATION:
            case Enums.FieldType.UTILITY:
                Helper.toDark(items[0]);
                items[1].setStyle(Consts.TextStyle.FieldMiddleDark);
                Helper.toDark(items[2]);
                break;

            default: 
                throw `wrong field type ${config.type}`;
        }
    }

    _stopCardDark(card) {
        const config = FieldInfo.Config[card.index];

        /** @type {Phaser.GameObjects.Container} */
        const container = card.container;
        const items = container.getAll();

        switch (config.type) {
            case Enums.FieldType.PROPERTY:
                Helper.toLight(items[0]);
                items[1].setFrame(config.color);
                items[2].setStyle(Consts.TextStyle.FieldSmallLight);
                Helper.toLight(items[3]);
                break;

            case Enums.FieldType.RAILSTATION:
            case Enums.FieldType.UTILITY:
                Helper.toLight(items[0]);
                items[1].setStyle(Consts.TextStyle.FieldMiddleLight);
                Helper.toLight(items[2]);
                break;

            default: 
                throw `wrong field type ${config.type}`;
        }
    }   

    _updateGridForCard(player, grid, updated, buy, ignoreTween) {
        const me = this;

        var startX = grid.length * 190 / -2;

        for (let i = 0; i < grid.length; ++i) 
        for (let j = 0; j < grid[i].length; ++j) {
            const card = Utils.single(me._cards, (c) => c.index == grid[i][j]);

            const position = Helper.rotate(
                Utils.buildPoint(
                    startX + i * 190,    
                    1600 + j * 220
                ),
                player);

            if (ignoreTween) {
                card.container.setPosition(position.x, position.y);
                continue;
            }
                
            if (card.index != updated) {
                me._moveCard(card, position);
                continue;
            }

            if (buy)
                me._buyCard(card, position);
            else
                me._sellCard(card);
        }
    }

    _buyCard(card, position) {
        const me = this;

        card.container
            .setPosition(0, 0)
            .setAlpha(0);

        me._scene.tweens.add({
            targets: card.container,
            x: position.x,
            y: position.y,
            alpha: { from: 0, to: 1 },
            duration: Consts.Speed.CenterEntranceDuration,
            ease: 'Sine.easeInOut'
        });
    }

    _moveCard(card, position) {
        const me = this;

        me._scene.tweens.add({
            targets: card.container,
            x: position.x,
            y: position.y,
            duration: Consts.Speed.CardShiftDuration,
            ease: 'Sine.easeInOut'
        });
    }

    _sellCard(card) {
        const me = this;

        me._scene.tweens.add({
            targets: card.container,
            x: 0,
            y: 0,
            alpha: { from: 1, to: 0 },
            duration: Consts.Speed.CenterEntranceDuration,
            ease: 'Sine.easeInOut',
            onComplete: () => { card.container.setVisible(false); }
        });
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {Object} config 
     * @returns {Phaser.GameObjects.GameObject[]}
     */
    _getContent(scene, config) {
        switch (config.type) {
            case Enums.FieldType.PROPERTY:
                return [
                    scene.add.image(0, 0, 'cards', 0),
                    scene.add.image(0, -75, 'field_header', config.color),
                    scene.add.text(0, -30, config.name, Consts.TextStyle.FieldSmallLight).setOrigin(0.5),
                    scene.add.image(0, 30, 'icons', config.icon)
                ];

            case Enums.FieldType.RAILSTATION:
                return [
                    scene.add.image(0, 0, 'cards', 0),
                    scene.add.text(0, -65, config.name, Consts.TextStyle.FieldMiddleLight).setOrigin(0.5),
                    scene.add.image(0, 20, 'icons_big', 4).setScale(0.75)
                ];

            case Enums.FieldType.UTILITY:
                return [
                    scene.add.image(0, 0, 'cards', 0),
                    scene.add.text(0, -65, config.name, Consts.TextStyle.FieldMiddleLight).setOrigin(0.5),
                    scene.add.image(0, 20, 'icons_big', config.icon).setScale(0.75)
                ];

            default: 
                throw `wrong field type ${config.type}`;
        }
    }

    _initCards(scene) {
        const me = this;
        const cards = [];

        for (let i = 0; i < Consts.FieldCount; ++i) {
            const config = FieldInfo.Config[i];

            if (!Utils.contains(Consts.BuyableFieldTypes, config.type))
                continue;

            const card = {
                index: i,
                container: scene.add.container(0, 300, me._getContent(scene, config))
                    .setVisible(false)
                    .setDepth(Consts.Depth.Cards)
            };
            cards.push(card);
        }

        return cards;
    }
}