import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';
import Utils from '../Utils.js';
import Board from './Board.js';
import Players from './Players.js';

export default class Highlight {
    
    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Group} */
    _pool;

    /** @type {Phaser.GameObjects.Image[][]} */
    _highlights;

    /** @type {Board} */
    _board;

    /** @type {Players} */
    _players;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Board} board 
     * @param {Players} players 
     */
    constructor(scene, board, players) {
        const me = this;

        me._scene = scene;
        me._pool = scene.add.group();
        me._board = board;
        me._players = players;

        me._highlights = [];
        me.initStartHighlits();
    }

    update() {
        const me = this;

        if (!me._highlights)
            return;

        const pointer = Utils.buildPoint(
            me._scene.input.activePointer.worldX,
            me._scene.input.activePointer.worldY);

        for (let i = 0; i < me._highlights.length; ++i) {
            const visible = me._mouseOnPiece(pointer, me._highlights[i].piece);
            me._setVisible(me._highlights[i].tiles, visible);
        }
    }

    _mouseOnPiece(mouse, piece) {
        const me = this;

        return mouse.x >= piece.x - Consts.UnitSmall
            && mouse.x <= piece.x + Consts.UnitSmall
            && mouse.y >= piece.y - Consts.UnitSmall
            && mouse.y <= piece.y + Consts.UnitSmall;
    }

    _setVisible(sprites, visible) {
        for (let i = 0; i < sprites.length; ++i)
            sprites[i].setVisible(visible);
    }

    initStartHighlits() {
        const me = this;

        me._clearHighlights();

        const minAlpha = 0.3;
        const maxAlpha = 0.8;

        const pieces = me._players.getAllPieces();
        for (let i = 0; i < pieces.length; ++i) {
            const pieceCell = pieces[i];
            const path = me._board.getPath(pieceCell.player, pieceCell.index);
            if (!path || path.length == 0)
                continue;

            const hightlight = [];
            for (let j = 0; j < path.length; ++j) {
                const cell = path[j];

                const tile = me._pool.create(cell.x, cell.y, 'highlight', 0);
                tile.setDepth(Consts.Depth.Highlight);
                tile.setVisible(false);
                const alphaFactor = path.length <= 10 
                    ? 1 
                    : (path.length - j - 1) / path.length;
                tile.setAlpha(minAlpha + alphaFactor * (maxAlpha - minAlpha));

                hightlight.push(tile);
            }
            me._highlights.push({piece: pieceCell, tiles: hightlight});
        }
    }

    initStepHightlits(player, available) {
        const me = this;

        me._clearHighlights();
        const maxAlpha = 0.8;

        for (let i = 0; i < available.length; ++i) {
            const step = available[i];
            if (!!step.bonus)
                continue;

            if (step.from.index === -1)
                continue; //TODO

            const path = me._board.getPath(player, step.from.index, step.to.index);
            if (!path || path.length == 0)
                continue;

            const hightlight = [];
            for (let j = 0; j < path.length; ++j) {
                const cell = path[j];

                const tile = me._pool.create(cell.x, cell.y, 'highlight', 0);
                tile.setDepth(Consts.Depth.Highlight);
                tile.setVisible(false);
                tile.setAlpha(maxAlpha);

                hightlight.push(tile);
            }
            me._highlights.push({piece: step.from, tiles: hightlight});
        }
    }

    _clearHighlights() {
        const me = this;

        for (let i = 0; i < me._highlights.length; ++i)
            for (let j = 0; j < me._highlights[i].tiles.length; ++j)
                me._pool.killAndHide(me._highlights[i].tiles[j]);

        me._highlights = [];
    }
}