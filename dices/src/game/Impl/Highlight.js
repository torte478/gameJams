import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
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

    _isEnemyStep;

    _homeSteps;

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
        me._isEnemyStep = false;
        me._homeSteps = [];

        me._highlights = [];
        me.initStartHighlits();
    }

    update() {
        const me = this;

        if (me._isEnemyStep)
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

        if (piece.index == -1)
            return me._players.isStorageClick(mouse);

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

        me.clearHighlights();

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

                const frame = pieceCell.player === Enums.Player.HUMAN ? 0 : 1;

                const tile = me._pool.create(cell.x, cell.y, 'highlight', frame);
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

        me.clearHighlights();
        const maxAlpha = 0.8;

        for (let i = 0; i < available.length; ++i) {
            const step = available[i];
            if (!!step.bonus)
                continue;

            let path;
            if (step.from.index === -1)
                path = [ step.to ];
            else
                path = me._board.getPath(player, step.from.index, step.to.index, step.isCycle);
            if (!path || path.length == 0)
                continue;

            const hightlight = [];
            for (let j = 0; j < path.length; ++j) {
                const cell = path[j];

                const frame = player === Enums.Player.HUMAN ? 0 : 1;

                const tile = me._pool.create(cell.x, cell.y, 'highlight', frame);
                tile.setDepth(Consts.Depth.Highlight);
                tile.setVisible(false);
                tile.setAlpha(maxAlpha);

                hightlight.push(tile);
            }
            me._highlights.push({piece: step.from, tiles: hightlight});
        }
    }

    showEnemy(step) {
        const me = this;
        me.clearHighlights();

        let path;
        if (step.from.index === -1)
            path = [ step.to ];
        else
            path = me._board.getPath(step.from.player, step.from.index, step.to.index, step.isCycle);

        if (!path || path.length == 0)
            return;

        const hightlight = [];
        const maxAlpha = 0.8;
        for (let j = 0; j < path.length; ++j) {
            const cell = path[j];

            const frame = 1;

            const tile = me._pool.create(cell.x, cell.y, 'highlight', frame);
            tile.setDepth(Consts.Depth.Highlight);
            tile.setAlpha(maxAlpha);

            hightlight.push(tile);
        }
        me._highlights.push({piece: step.from, tiles: hightlight}); 
        me._isEnemyStep = true;           
    }

    clearHighlights() {
        const me = this;

        me._isEnemyStep = false;
        for (let i = 0; i < me._highlights.length; ++i)
            for (let j = 0; j < me._highlights[i].tiles.length; ++j)
                me._pool.killAndHide(me._highlights[i].tiles[j]);

        me._highlights = [];
    }

    checkHomeStepToDelete(step) {
        const me = this;

        const index = Utils.firstIndexOrNull(me._homeSteps, h => h.cell.isEqualPos(step.from));
        if (index == null)
            return;

        me._pool.killAndHide(me._homeSteps[index].tile);
        me._homeSteps = Utils.removeAt(index);
    }

    checkHomeStepToAdd(step) {
        const me = this;

        const circle = me._board.getCircleLength();
        if (step.to.index <= circle)
            return;

        const cell = step.to;
        const frame = step.from.player === Enums.Player.HUMAN ? 2 : 3;
        const tile = me._pool.create(cell.x, cell.y, 'highlight', frame);
        tile.setDepth(Consts.Depth.Highlight);
        tile.setAlpha(1);

        const homeStep = {
            cell: cell,
            tile: tile
        };
        me._homeSteps.push(homeStep);
    }
}