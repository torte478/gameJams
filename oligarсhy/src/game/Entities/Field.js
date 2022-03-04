import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Enums from '../Enums.js';

export default class Field {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Number[]} */
    _pieces;

    /** @type {Number} */
    _index;

    /**
     * @param {Phaser.GameObjects.Container} container 
     */
    constructor(container, index) {
        const me = this;
        me._container = container;
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
}