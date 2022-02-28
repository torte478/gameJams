import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Enums from './Enums.js';

export default class Field {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Number[]} */
    _pieces;

    /**
     * @param {Phaser.GameObjects.Container} container 
     */
    constructor(container) {
        const me = this;
        me._container = container;
        
        me._pieces = [];
        for (let i = 0; i < Config.PlayerCount; ++i) {
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
}