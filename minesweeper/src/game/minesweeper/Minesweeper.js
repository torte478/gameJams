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
import Audio from '../utils/Audio.js';
import ButtonConfig from '../utils/ButtonConfig.js';
import Button from '../utils/Button.js';

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

    /** @type {Audio} */
    _audio;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Status} status
     * @param {Graphics} graphics
     */
    constructor(scene, status, graphics, reserve, audio, mineTheme, transfer) {
        const me = this;

        me._scene = scene;
        me._status = status;
        me._graphics = graphics;
        me._audio = audio;
        me._mineTheme = mineTheme;
        me._needTutorial = status.level == Consts.FirstLevel;
        me._needKillByShot = status.level == Consts.FirstLevel;
        me._transfer = transfer;

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
        scene.add.image(60, 180, 'mine_hud', 0).setDepth(Consts.Depth.UI);
        me._hud = scene.add.text(70, 180, me._availableFlags, { fontFamily: "Arial Black", fontSize: 24, color: '#6a7798' })
            .setOrigin(0, 0.5)
            .setDepth(Consts.Depth.UI);

        const ecb = new ButtonConfig();
        ecb.x = Consts.Viewport.Width - 60;
        ecb.y = 60;
        ecb.texture = 'items';
        ecb.frameIdle = 19;
        ecb.frameSelected = 19;
        ecb.callback = () => { 
            me._scene.sound.stopAll();
            me._scene.scene.start('start', { startTime: me._status.startTime });
        };
        ecb.callbackScope = me;
        ecb.sound = 'action_start';

        const vvv = new Button(me._scene, me._audio, ecb);
        vvv._container.setScrollFactor(0);

        me._timeText = me._scene.add.text(
            300, 
            220, 
            '1.23',
            { fontFamily: 'Arial Black', fontSize: 24, color: '#F2FCF2' })
            .setDepth(Consts.Depth.Max + 100)
            .setAlpha(0);


        me._staticText = me._scene.add.text(
            300, 
            250, 
            'people died during real wars\nwhile you are playing this game',
            { fontFamily: 'Arial Black', fontSize: 24, color: '#F2FCF2' })
            .setDepth(Consts.Depth.Max + 100)
            .setAlpha(0);

        me._stopWarText = me._scene.add.text(
            300, 
            400, 
            'stop war',
            { fontFamily: 'Arial Black', fontSize: 24, color: '#F2FCF2' })
            .setDepth(Consts.Depth.Max + 100)
            .setAlpha(0);
    }

    /** @type {Phaser.Geom.Point} */
    update(pointer) {
        const me = this;

        me._field.update(pointer);
        me._clock.update();

        const min = (new Date().getTime() - me._status.startTime) / (60 * 1000);
        const result = min * 0.155;
        const text = result.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        me._timeText.setText(text);
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

        me._audio.play('action_start');

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
            me._hud.setColor('#40C35C');
        else if (me._availableFlags > 0)
            me._hud.setColor('#6a7798');
        else
            me._hud.setColor('#D16708');
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

        if (me._reserve.getSoilderCount() == 0) {
            me._field.decreaseAlpha();
            for (let i = 0; i < me._soldiers.length; ++i)
                me._soldiers[i]._cross.play('solder_cant');

            me._scene.time.delayedCall(1000, () => { me._finishStep() });
            return;
        }

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
            const wasOpen = me._field.isOpen(cellIndex);

            const content = me._field.openCell(cellIndex);

            if (!wasOpen) {
                if (content == Enums.Cell.Empty0)
                    me._audio.play('empty_cell');
                    
                if (content >= Enums.Cell.Empty1 && content <= Enums.Cell.Empty8)
                    me._audio.play(`mine_detect_${content}`);
            }

            me._finishStep();
        }
    }

    _moveSoldier(index) {
        const me = this;

        const soldierPositions = me._soldiers.map(s => s.getCellIndex());

        if (Utils.any(soldierPositions, s => s === index))
            return me._finishStep();

        const path = me._field.findPath(index, soldierPositions);

        if (!path) {
            return me._finishStep();
        }

        me._field.decreaseAlpha();
        const soldierIndex = Utils.firstIndexOrNull(me._soldiers, s => s.getCellIndex() === path.soldierIndex);
        me._soldiers[soldierIndex].move(soldierIndex, index, path.cells, me._onSoldierStep, me)
    }

    _finishStep() {
        const me = this;

        if (me._clock.isAlarm() && me._soldiers.length > 0)
            return me._tryKillByClock();

        if (me._soldiers.length == 0)
            me._clock.stop();

        if (!me._clock.isAlarm() && !me._clock.isRunning() && me._soldiers.length > 0)
            me._clock.reset();

        me._updateHud();

        if (me._field.isWin()) {
            me._mineTheme.stop();
            me._audio.play('win', { volume: 0.5 });
            me._clock.stop();

            me._scene.add.text(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'YOU WIN', { 
                fontFamily: 'Arial Black',
                fontSize: 84,
                color: '#e3f0ff'})
                .setStroke('#6a7798', 16)
                .setShadow(2, 2, '#333333', 2)
                .setScrollFactor(0)
                .setOrigin(0.5, 0.5)
                .setDepth(Consts.Depth.Max);


            me._scene.time.delayedCall(5000, () => {
                me._scene.sound.stopAll();
                me._scene.scene.start('game', { level: me._status.level + 1, startTime: me._status.startTime});
            });
            return;
        }

        if (me._soldiers.length == 0 
            && me._reserve.getSoilderCount() == 0 
            && me._status.avaialbeCitizens == 0) {

                if (me._status.level == Consts.LastLevel)
                    return me._endGame();

                me._mineTheme.stop();
                me._audio.play('lose', { volume: 0.5 });
                me._clock.stop();

                me._scene.add.text(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'YOU LOSE', { 
                    fontFamily: 'Arial Black',
                    fontSize: 84,
                    color: '#e3f0ff'})
                    .setStroke('#6a7798', 16)
                    .setShadow(2, 2, '#333333', 2)
                    .setScrollFactor(0)
                    .setOrigin(0.5, 0.5)
                    .setDepth(Consts.Depth.Max);


                me._scene.time.delayedCall(5000, () => {
                    me._scene.sound.stopAll();
                    me._scene.scene.restart({ level: me._status.level, startTime: me._status.startTime});
                });
                return;
            }

        if (me._needTutorial) {
            me._transfer._button.setVisible(true);

            me._scene.add.tween({
                targets: me._transfer._button,
                scale: { from: 1, to: 2 },
                yoyo: true,
                duration: 500,
                onComplete: () => me._transfer._button.setScale(1),
            });
        }

        me._reserve.updateHud(me._corpses.length);

        me._needTutorial = false;

        me._field.lockAlpha = false;
        me._status.free();        
    }

    _endGame() {
        const me = this;

        me._scene.sound.stopAll();
        me._audio.play('ending', { volume: 0.75 });

        me._scene.time.delayedCall(10000, 
            () => {
            const fade = me._scene.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'fade')
                .setDepth(Consts.Depth.Max)
                .setAlpha(0);

            me._scene.add.tween({
                targets: fade,
                duration: 5000,
                alpha: { from: 0, to: 1},
                onComplete: () => {

                    me._scene.add.tween({
                        targets: [ me._timeText, me._staticText ],
                        duration: 5000,
                        alpha: { from: 0, to: 1},
                        delay: 1000,
                        onComplete: () => {
                            console.log('complete');

                            me._scene.add.tween({
                                targets: me._stopWarText,
                                duration: 5000,
                                alpha: { from: 0, to: 1},
                                delay: 10000
                            })
                        }
                    })
                }
            });
        })
    }

    _explodeMine(soldierIndex, cellIndex) {
        const me = this;

        me._field.explode(cellIndex);
        me._maxFlags -= 1;
        me._updateHud();

        if (me._needTutorial)
            me._scene.sound.stopByKey('city_theme');
        
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

        const isDeath = me._needKillByShot || Utils.getRandom(1, 100, 99) <= Config.Levels[me._status.level].TimerDeathProbability;
        me._needKillByShot = false;

        if (!isDeath)
            me._soldiers[soldierIndex]._sprite.play('soldier_dodge');

        const shot = me._graphics.createShot(Utils.buildPoint(
            fromRight ? Consts.Viewport.Width + Consts.UnitMiddle : -Consts.UnitMiddle,
            position.y));

        const target = Utils.buildPoint(
            isDeath 
                ? position.x + Consts.Unit * (fromRight ? -1 : 1)
                : (fromRight ? -Consts.UnitMiddle : Consts.Viewport.Width + Consts.UnitMiddle),
            position.y);

        me._audio.play('shot');

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
                
                if (isDeath) {
                    me._audio.play('hurt');
                    me._killSoldier(
                        soldierIndex, 
                        soldier.getCellIndex(),
                        Enums.Death.Shot);
                }
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

        const position = soldier.toPoint();
        const corpse = me._corpsePool.getNext(position, Enums.Corpse.Body);
        me._corpses.push(corpse);

        if (type == Enums.Death.Mine)  {
            me._graphics.createExplosion(cellPosition);
            me._graphics.createSmoke(cellPosition);

            me._audio.play('explosion');
        }

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

        me._audio.play('action_start');

        const index = Utils.getRandom(0, me._corpses.length - 1);
        const corpse = me._corpses[index];
        me._corpses = Utils.removeAt(me._corpses, index);
        corpse.setDepth(Consts.Depth.UnderUI);

        me._reserve.fillCoffin(corpse, me._onCoffinFill, me);
    }

    _onCoffinFill(corpse) {
        const me = this;
        me._corpsePool.release(corpse);
        me._audio.play('action_end');
        me._finishStep();
    }
}       