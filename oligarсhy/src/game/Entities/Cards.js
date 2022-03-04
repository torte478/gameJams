import Phaser from "../../lib/phaser.js";

import Config from "../Config.js";
import Consts from "../Consts.js";
import Enums from "../Enums.js";
import Helper from "../Helper.js";
import Utils from "../Utils.js";

export default class Cards {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Object[]} */
    _cards;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor (scene) {
        const me = this;

        me._scene = scene;

        me._cards = [];
        for (let i = 0; i < Consts.FieldCount; ++i) {
            const config = Config.Fields[i];

            if (!Utils.contains(Consts.BuyableFieldTypes, config.type))
                continue;

            const card = {
                index: i,
                container: scene.add.container(0, 300, me._getContent(scene, config))
                    .setVisible(false)
                    .setDepth(Consts.Depth.Cards)
            };
            me._cards.push(card);
        }
    }

    buy(field, player, grid, ignoreTween) {
        const me = this;

        const card = Utils.single(me._cards, (c) => c.index == field);

        if (card.container.visible)
            throw `card ${field} already visible`;

        card.container
            .setVisible(true)
            .setAngle(Helper.getAngle(player));

        me._updateGrid(player, grid, field, true, ignoreTween);
    }

    sell(field, player, grid) {
        const me = this;

        const card = Utils.single(me._cards, (c) => c.index == field);

        if (!card.container.visible)
            throw `card ${field} already hidden`;

        me._updateGrid(player, grid, field, false);
    }

    getFieldIndex(point) {
        const me = this;

        const card =  Utils.firstOrDefault(
            me._cards,
            (c) => c.container.visible
                   && Phaser.Geom.Rectangle.ContainsPoint(
                        c.container.getBounds(),
                        point))

        return card != null
            ? card.index
            : null;
    }

    _updateGrid(player, grid, field, buy, ignoreTween) {
        const me = this;

        const startX = grid.length * 190 / -2;
        const angle = Helper.getAngle(player);

        for (let i = 0; i < grid.length; ++i) 
        for (let j = 0; j < grid[i].length; ++j) {
            const item = Utils.single(me._cards, (c) => c.index == grid[i][j]);

            const position = Phaser.Math.RotateAround(
                Utils.buildPoint(
                    startX + i * 190,    
                    1600 + j * 220
                ),
                0,
                0,
                Phaser.Math.DegToRad(angle));

            if (!!ignoreTween) {
                item.container.setPosition(position.x, position.y);
                continue;
            }

            if (item.index != field) {
                me._scene.tweens.add({
                    targets: item.container,
                    x: position.x,
                    y: position.y,
                    duration: Consts.Speed.CardShiftDuration,
                    ease: 'Sine.easeInOut'
                });
            } else if (buy) {
                const point = Helper.getOuterPos(player);
                item.container.setPosition(point.x, point.y);

                me._scene.tweens.add({
                    targets: item.container,
                    x: position.x,
                    y: position.y,
                    duration: Consts.Speed.CardOuterDuration,
                    ease: 'Sine.easeInOut'
                });
            }
        }

        if (!buy) {
            const item = Utils.single(me._cards, (c) => c.index == field);
            const point = Helper.getOuterPos(player);

            me._scene.tweens.add({
                targets: item.container,
                x: point.x,
                y: point.y,
                duration: Consts.Speed.CardOuterDuration,
                ease: 'Sine.easeInOut',
                onComplete: () => { item.container.setVisible(false); }
            });
        }
    }

    _getContent(scene, config) {
        const me = this;

        switch (config.type) {
            case Enums.FieldType.PROPERTY:
                return [
                    scene.add.image(0, 0, 'cards', 0),
                    scene.add.image(0, -75, 'field_header', config.color),
                    scene.add.text(0, -30, config.name, Consts.TextStyle.FieldSmall).setOrigin(0.5),
                    scene.add.image(0, 30, 'icons', config.icon)
                ];

            case Enums.FieldType.RAILSTATION:
                return [
                    scene.add.image(0, 0, 'cards', 0),
                    scene.add.text(0, -65, config.name, Consts.TextStyle.FieldMiddle).setOrigin(0.5),
                    scene.add.image(0, 20, 'icons_big', 4).setScale(0.75)
                ];

            case Enums.FieldType.UTILITY:
                return [
                    scene.add.image(0, 0, 'cards', 0),
                    scene.add.text(0, -65, config.name, Consts.TextStyle.FieldMiddle).setOrigin(0.5),
                    scene.add.image(0, 20, 'icons_big', config.icon).setScale(0.75)
                ];

            default: 
                throw `wrong field type ${config.type}`;
        }
    }
}