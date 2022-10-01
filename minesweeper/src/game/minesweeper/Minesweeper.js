import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Field from './Field.js';
import Soldier from './Soldier.js';
import Status from '../Status.js';
import SoldierPool from './SoldierPool.js';

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

    /**
     * @param {Phaser.Scene} scene 
     * @param {Status} status
     */
    constructor(scene, status) {
        const me = this;

        me._scene = scene;
        me._status = status;

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
    }

    /** @type {Phaser.Geom.Point} */
    update(pointer) {
        const me = this;

        me._field.update(pointer);
    }

    _onCellClick(index) {
        const me = this;

        if (me._needSpawnSolder(index))
            me._spawnSoldier(index);
        else
            me._moveSoldier(index);
    }

    _needSpawnSolder(index) {
        const me = this;

        return me._soldiers.length == 0;
    }

    _spawnSoldier(index) {
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

        if (me._field.isMine(cellIndex)) {
            console.log('babah');
        }
        else {
            me._field.openCell(cellIndex);
            me._status.free();
        }
    }

    _moveSoldier(index) {
        const me = this;

        console.log(`move soldier to ${index}`);
        me._status.free();
    }
}       