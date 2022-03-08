import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';

export default class Field {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Number[]} */
    _pieces;

    /** @type {Number} */
    _index;

    /** @type {Phaser.GameObjects.Image} */
    _selection;

    /** @type {Phaser.Tweens.Tween} */
    _tween;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {String} backgroundTexture 
     * @param {Number} angle 
     * @param {Number} index 
     */
    constructor(scene, x, y, backgroundTexture, angle, index) {
        const me = this;

        const config = Config.Fields[index],
              content = me._getFieldContent(scene.add, config);

        me._selection = scene.add.image(0, 0, backgroundTexture, 2).setVisible(false);

        me._tween = scene.tweens.add({
            targets: me._selection,
            scale: { from: 1, to: 1.25 },
            duration: Consts.Speed.Selection,
            yoyo: true,
            repeat: -1
        });

        const children = [ 
            me._selection,
            scene.add.image(0, 0, backgroundTexture, 0) 
            ]
            .concat(content);

        me._container = scene.add.container(x, y, children)
            .setAngle(angle);
        me._index = index;
        
        me._pieces = [];
        for (let i = 0; i < Config.Start.PlayerCount; ++i) {
            me._pieces.push(Enums.PlayerIndex.NOONE)
        }
    }

    /**
     * @returns {Phaser.Geom.Rectangle}
     */
    getBounds() {
        const me = this;

        return me._container.getBounds();
    }

    /**
     * @returns {Phaser.Geom.Point}
     */
    toPoint() {
        const me = this;

        return new Phaser.Geom.Point(me._container.x, me._container.y);
    }

    /**
     * @param {Number} player 
     */
    removePiece(player) {
        const me = this;

        for (let i = 0; i < me._pieces.length; ++i) {
            if (me._pieces[i] == player)
                me._pieces[i] = Enums.PlayerIndex.NOONE
        }
    }

    /**
     * @param {Number} player 
     */
    addPiece(player) {
        const me = this;

        for (let position = 0; position < me._pieces.length; ++position) {

            if (me._pieces[position] == Enums.PlayerIndex.NOONE) {
                me._pieces[position] = player;
                return position;
            }
        }

        throw `can't find free space for player: ${player}`;
    }

    buy(player, rent) {
        const me = this;

        const items = me._container.getAll();

        items[items.length - 3]
            .setFrame(player == Enums.PlayerIndex.HUMAN ? 9 : 10)
            .setVisible(true);

        items[items.length - 2]
            .setFrame(player * 2)
            .setVisible(true);

        items[items.length - 1].setVisible(true);
    }

    updateRent(player, rent) {
        const me = this;

        const items = me._container.getAll();
        const text = `${player == Enums.PlayerIndex.HUMAN ? '+' : '-'} ${rent}`;
        items[items.length - 1].setText(text);
    }

    sell() {
        const me = this;

        const items = me._container.getAll();
        items[items.length - 3].setVisible(false);
        items[items.length - 2].setVisible(false);
        items[items.length - 1].setVisible(false);
    }

    select() {
        const me = this;

        me._selection.setVisible(true);
        me._tween.resume();
        me._container.setDepth(Consts.Depth.SelectedField);
    }

    unselect() {
        const me = this;

        me._selection.setVisible(false);
        me._container.setDepth(Consts.Depth.Board);
        me._tween.pause();
    }

     /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     * @param {Object} config 
     * @returns {Phaser.GameObjects.GameObject[]}
     */
    _getFieldContent(factory, config) {
        const me = this;

        switch (config.type) {
            case Enums.FieldType.PROPERTY:
                return [
                    factory.image(0, -95, 'field_header', config.color),
                    factory.image(0, 20, 'icons', config.icon),
                    factory.text(0, -40, config.name, Consts.TextStyle.FieldSmall).setOrigin(0.5),
                    factory.text(0, 95, config.cost, Consts.TextStyle.FieldMiddle).setOrigin(0.5),
                    factory.image(0, 144, 'field_header', 9).setVisible(false),
                    factory.image(-50, 144, 'pieces', 0).setScale(0.5).setVisible(false),
                    factory.text(20, 144, 'RENT', Consts.TextStyle.FieldMiddle).setOrigin(0.5).setVisible(false)
                ];

            case Enums.FieldType.CHANCE:
                return [
                    factory.image(0, 20, 'icons_big', 0),
                    factory.text(0, -90, 'CHANCE', Consts.TextStyle.FieldBig).setOrigin(0.5)
                ];

            case Enums.FieldType.TAX:
                return [
                    factory.image(0, 0, 'icons_big', 2),
                    factory.text(0, -90, 'TAX', Consts.TextStyle.FieldBig).setOrigin(0.5),
                    factory.text(0, 95, `PAY ${config.cost}`, Consts.TextStyle.FieldMiddle).setOrigin(0.5),
                ];

            case Enums.FieldType.RAILSTATION:
                return [
                    factory.image(0, 0, 'icons_big', 4),
                    factory.text(0, -90, config.name, Consts.TextStyle.FieldMiddle).setOrigin(0.5),
                    factory.text(0, 95, config.cost, Consts.TextStyle.FieldMiddle).setOrigin(0.5),
                    factory.image(0, 144, 'field_header', 9).setVisible(false),
                    factory.image(-50, 144, 'pieces', 0).setScale(0.5).setVisible(false),
                    factory.text(20, 144, 'RENT', Consts.TextStyle.FieldMiddle).setOrigin(0.5).setVisible(false)
                ];

            case Enums.FieldType.UTILITY:
                return [
                    factory.image(0, 0, 'icons_big', config.icon),
                    factory.text(0, -90, config.name, Consts.TextStyle.FieldSmall).setOrigin(0.5),
                    factory.text(0, 95, config.cost, Consts.TextStyle.FieldMiddle).setOrigin(0.5),
                    factory.image(0, 144, 'field_header', 9).setVisible(false),
                    factory.image(-50, 144, 'pieces', 0).setScale(0.5).setVisible(false),
                    factory.text(20, 144, 'RENT', Consts.TextStyle.FieldMiddle).setOrigin(0.5).setVisible(false)
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
}