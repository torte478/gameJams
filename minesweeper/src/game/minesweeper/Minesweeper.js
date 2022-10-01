import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Field from './Field.js';
import Soldier from './Soldier.js';
import Status from '../Status.js';
import SoldierPool from './SoldierPool.js';
import Utils from '../utils/Utils.js';
import Enums from '../Enums.js';
import CorpsePool from './CorpsePool.js';
import Helper from '../Helper.js';
import Graphics from '../Graphics.js';

export default class Minesweeper {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Field} */
    _field;

    /** @type {Soldier[]} */
    _soldiers;

    /** @type {Status} */
    _status;

    /** @type {SoldierPool} */
    _soldierPool;

    /** @type {CorpsePool} */
    _corpsePool;

    /** @type {Graphics} */
    _graphics;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Status} status
     * @param {Graphics} graphics
     */
    constructor(scene, status, graphics) {
        const me = this;

        me._scene = scene;
        me._status = status;
        me._graphics = graphics;

        scene.add.image(
                Consts.Viewport.Width / 2, 
                Consts.Viewport.Height / 2, 
                'minesweeper_background')
            .setDepth(Consts.Depth.Background);
        
        me._field = new Field(
            scene, 
            status,
            (Consts.Viewport.Width - Consts.Unit * Config.Field.Width) / 2, 
            (Consts.Viewport.Height - Consts.Unit * Config.Field.Height) / 2, 
            Config.Field.Width, 
            Config.Field.Height);
        me._field.emitter.on('cellClick', me._onCellClick, me);

        me._soldiers = [];
        me._soldierPool = new SoldierPool(scene);
        me._corpsePool = new CorpsePool(scene);
    }

    /** @type {Phaser.Geom.Point} */
    update(pointer) {
        const me = this;

        me._field.update(pointer);
    }

    _onCellClick(index) {
        const me = this;

        if (me._needSpawnSolder(index))
            me._trySpawnSoldier(index);
        else
            me._moveSoldier(index);
    }

    _needSpawnSolder(index) {
        const me = this;

        return me._soldiers.length == 0; //TODO
    }

    _trySpawnSoldier(index) {
        const me = this;

        const soldier = me._soldierPool.getNext();
        me._soldiers.push(soldier);
        const soldierIndex = me._soldiers.length - 1;

        soldier.spawn(
            soldierIndex,
            index,
            me._field.toPosition(index),
            me._onSoldierStep,
            me);
    }

    _onSoldierStep(soldierIndex, cellIndex) {
        const me = this;

        if (me._field.canExplode(cellIndex)) {
            me._explodeMine(soldierIndex, cellIndex);
        }
        else {
            me._field.openCell(cellIndex);
            me._status.free();
        }
    }

    _moveSoldier(index) {
        const me = this;

        const soldierPositions = me._soldiers.map(s => s.getCellIndex());
        const path = me._field.findPath(index, soldierPositions);

        if (!path) {
            console.log("can't find path");
            return me._status.free();
        }

        const soldierIndex = Utils.firstIndexOrNull(me._soldiers, s => s.getCellIndex() === path.soldierIndex);
        me._soldiers[soldierIndex].move(soldierIndex, index, path.cells, me._onSoldierStep, me)
    }

    _explodeMine(soldierIndex, cellIndex) {
        const me = this;

        me._field.explode(cellIndex);
        
        const soldier = me._soldiers[soldierIndex];
        Utils.removeAt(me._soldiers, soldierIndex);

        me._soldierPool.release(soldier);

        const cellPosition = me._field.toPosition(cellIndex);
        me._graphics.createSmoke(cellPosition)

        const position = soldier.toPoint();
        const corpse = me._corpsePool.getNext(position, Enums.Corpse.Body);

        me._graphics.createExplosion(cellPosition);

        const upY = position.y - Consts.Explode.BodyHeight;
        const downY = position.y
        me._scene.tweens.timeline({
            targets: corpse.toGameObject(),
            tweens: [
                {
                    y: upY,
                    duration: Consts.Explode.BodyDuration,
                    ease: 'Sine.easeOut'
                },
                {
                    y: downY,
                    duration: Consts.Explode.BodyDuration,
                    ease: 'Sine.easeIn',
                    onComplete: () => { 
                        corpse.idle();
                        me._graphics.createBloodSpot(cellPosition, corpse.getDepth())
                     }
                }
            ],
            onUpdate: () => { corpse.updateShadow(downY, upY) },
            onComplete: me._onExplodeMineComplete,
            onCompleteScope: me
        });
    }

    _onExplodeMineComplete() {
        const me = this;

        console.log('explode complete');
        me._status.free();
    }
}       