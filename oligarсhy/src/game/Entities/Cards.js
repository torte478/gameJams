import Phaser from "../../lib/phaser.js";

import Config from "../Config.js";
import Consts from "../Consts.js";
import Enums from "../Enums.js";
import Helper from "../Helper.js";
import Utils from "../Utils.js";

export default class Cards {

    /** @type {Object[]} */
    _cards;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor (scene) {
        const me = this;

        me._cards = [];
        for (let i = 0; i < Consts.FieldCount; ++i) {
            const config = Config.Fields[i];

            if (!Utils.contains(Consts.BuyableFieldTypes, config.type))
                continue;

            const card = {
                index: i,
                container: scene.add.container(0, 300, me._getContent(scene, config))
                    .setVisible(false)
            };
            me._cards.push(card);
        }
    }

    buy(field, player, grid) {
        const me = this;

        const card = Utils.single(me._cards, (c) => c.index == field);

        if (card.container.visible)
            throw `card ${field} already visible`;

        card.container.setVisible(true);

        me._updateGrid(player, grid);
    }

    sell(field, player, grid) {
        const me = this;

        const card = Utils.single(me._cards, (c) => c.index == field);

        if (!card.container.visible)
            throw `card ${field} already hidden`;

        card.container.setVisible(false);

        me._updateGrid(player, grid);
    }

    _updateGrid(player, grid) {
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

            item.container
                .setPosition(position.x, position.y)
                .setAngle(angle);
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