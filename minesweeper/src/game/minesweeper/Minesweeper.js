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
import Graphics from '../Graphics.js';
import Clock from './Clock.js';
import Reserve from '../Reserve.js';
import Corpse from './Corpse.js';

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

    /** @type {Clock} */
    _clock;

    /** @type {Reserve} */
    _reserve;

    /** @type {Corpse[]} */
    _corpses;

    /** @type {Phaser.GameObjects.Text} */
    _hud;

    /** @type {Number} */
    _availableFlags;

    /** @type {Number} */
    _maxFlags;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Status} status
     * @param {Graphics} graphics
     */
    constructor(scene, status, graphics, reserve) {
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
            Config.Field.Height,
            reserve);
        me._field.emitter.on('cellClick', me._onCellClick, me);

        me._soldiers = [];
        me._soldierPool = new SoldierPool(scene);
        me._corpsePool = new CorpsePool(scene);

        me._clock = new Clock(scene, Config.Timer);
        me._clock.emitter.on('alarm', me._onClockAlarm, me);

        me._reserve = reserve;

        me._reserve.emitter.on('coffinClick', me._onCoffinClick, me);
        me._corpses = [];

        me._maxFlags = Config.Levels[me._status.level].Mines;
        me._availableFlags = me._maxFlags;
        scene.add.image(40, 140, 'items', 19).setDepth(Consts.Depth.UI);
        me._hud = scene.add.text(70, 140, me._availableFlags, { fontSize: 24 })
            .setOrigin(0, 0.5)
            .setDepth(Consts.Depth.UI);
    }

    /** @type {Phaser.Geom.Point} */
    update(pointer) {
        const me = this;

        me._field.update(pointer);
        me._clock.update();
    }

    pause() {
        const me = this;

        me._clock.stop();
    }

    resume() {
        // ...
    }

    _onCellClick(index, button) {
        const me = this;

        if (button == 0) {
            me._status.busy();
            if (me._needSpawnSolder(index))
                me._trySpawnSoldier(index);
            else
                me._moveSoldier(index);
        } else if (button == 2) {
            me._field.changeFlag(index);

            me._updateHud();
        }
    }

    _updateHud() {
        const me = this;

        me._availableFlags = me._maxFlags - me._field.getFlagCount();

        me._hud.setText(me._availableFlags);

        if (me._availableFlags == 0)
            me._hud.setColor('#00FF00');
        else if (me._availableFlags > 0)
            me._hud.setColor('#FFFFFF');
        else
            me._hud.setColor('#FF0000');
    }

    _needSpawnSolder(index) {
        const me = this;

        const solderIndicies = me._soldiers.map(s => s.getCellIndex());
        if (Utils.any(solderIndicies, s => s === index))
            return false;

        return me._soldiers.length == 0
            || !me._field.isReached(
                index, 
                solderIndicies);
    }

    _trySpawnSoldier(index) {
        const me = this;

        if (me._reserve.getSoilderCount() == 0)
            return me._finishStep();

        const soldier = me._soldierPool.getNext();
        me._soldiers.push(soldier);
        const soldierIndex = me._soldiers.length - 1;

        me._field.decreaseAlpha();

        me._reserve.spawn();

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
            me._finishStep();
        }
    }

    _moveSoldier(index) {
        const me = this;

        const soldierPositions = me._soldiers.map(s => s.getCellIndex());

        if (Utils.any(soldierPositions, s => s === index))
            return me._finishStep();

        const path = me._field.findPath(index, soldierPositions);

        if (!path) 
            me._finishStep();

        me._field.decreaseAlpha();
        const soldierIndex = Utils.firstIndexOrNull(me._soldiers, s => s.getCellIndex() === path.soldierIndex);
        me._soldiers[soldierIndex].move(soldierIndex, index, path.cells, me._onSoldierStep, me)
    }

    _finishStep() {
        const me = this;

        if (me._clock.isAlarm() && me._soldiers.length > 0)
            return me._tryKillByClock();

        me._field.lockAlpha = false;

        if (me._soldiers.length == 0)
            me._clock.stop();

        if (!me._clock.isAlarm() && !me._clock.isRunning() && me._soldiers.length > 0)
            me._clock.reset();

        me._updateHud();

        if (me._field.isWin())
            throw 'WIN!';

        if (me._soldiers.length == 0 
            && me._reserve.getSoilderCount() == 0 
            && me._status.avaialbeCitizens == 0)
            throw 'LOSE!';

        me._status.free();        
    }

    _explodeMine(soldierIndex, cellIndex) {
        const me = this;

        me._field.explode(cellIndex);
        me._maxFlags -= 1;
        me._updateHud();
        
        me._killSoldier(soldierIndex, cellIndex, Enums.Death.Mine);
    }

    _onClockAlarm() {
        const me = this;

        if (me._soldiers.length == 0)
            me._clock.stop();

        if (me._status.isBusy || me._soldiers.length == 0)
            return;

        me._status.busy();
        me._field.decreaseAlpha();

        return me._tryKillByClock();
    }

    _tryKillByClock() {
        const me = this;

        const indicies = me._soldiers.map((s, i) => i);
        const soldierIndex = Utils.getRandomEl(indicies);

        const soldier = me._soldiers[soldierIndex]
        const position = soldier.toPoint();
        const fromRight = position.x < Consts.Viewport.Width / 2;

        const isDeath = Utils.getRandom(1, 100, 99) <= Config.Levels[me._status.level].TimerDeathProbability;

        const shot = me._graphics.createShot(Utils.buildPoint(
            fromRight ? Consts.Viewport.Width + Consts.UnitMiddle : -Consts.UnitMiddle,
            position.y));

        const target = Utils.buildPoint(
            isDeath 
                ? position.x + Consts.Unit * (fromRight ? -1 : 1)
                : (fromRight ? -Consts.UnitMiddle : Consts.Viewport.Width + Consts.UnitMiddle),
            position.y);

        me._scene.add.tween({
            targets: shot,
            x: target.x,
            duration: Utils.getTweenDuration(
                Utils.toPoint(shot),
                target,
                Consts.Speed.Shot),
            delay: 500,

            onComplete: () => {
                me._graphics.killAndHide(shot);
                me._clock.stop();
                
                if (isDeath)
                    me._killSoldier(
                        soldierIndex, 
                        soldier.getCellIndex(),
                        Enums.Death.Shot);
                else
                    me._finishStep();
            }
        });
    }

    _killSoldier(soldierIndex, cellIndex, type) {
        const me = this;
        
        const soldier = me._soldiers[soldierIndex];
        me._soldiers = Utils.removeAt(me._soldiers, soldierIndex);

        me._soldierPool.release(soldier);

        const cellPosition = me._field.toPosition(cellIndex);

        if (type == Enums.Death.Mine)
            me._graphics.createSmoke(cellPosition)

        const position = soldier.toPoint();
        const corpse = me._corpsePool.getNext(position, Enums.Corpse.Body);
        me._corpses.push(corpse);

        if (type == Enums.Death.Mine)
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
            onComplete: me._finishStep,
            onCompleteScope: me
        });
    }

    _onCoffinClick() {
        const me = this;

        if (me._status.isBusy || me._status.isCity)
            return;

        if (me._corpses.length == 0)
            return;

        me._status.busy();
        me._field.decreaseAlpha();

        const index = Utils.getRandom(0, me._corpses.length - 1);
        const corpse = me._corpses[index];
        me._corpses = Utils.removeAt(me._corpses, index);

        me._reserve.fillCoffin(corpse, me._onCoffinFill, me);
    }

    _onCoffinFill(corpse) {
        const me = this;
        me._corpsePool.release(corpse);
        me._finishStep();
    }
}       