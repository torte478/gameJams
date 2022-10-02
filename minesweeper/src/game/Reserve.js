import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './utils/Utils.js';
import Corpse from './minesweeper/Corpse.js';

export default class Reserve {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Object[]]} */
    _reserve;

    /** @type {Number} */
    _maxSize;

    /** @type {Status} */
    _status;

    /** @type {Phaser.Events.EventEmitter} */
    emitter;

    _x;

    constructor(scene, x, y, startCount, maxSize, status) {
        const me = this;

        me._scene = scene;
        me._maxSize = maxSize;
        me._status = status;

        me._x = x;

        me._reserve = [];
        for (let i = 0; i < maxSize; ++i) {

            const content = i >= startCount
                ? Enums.Reserve.Empty
                : Enums.Reserve.Soilder;

            const sprite = scene.add.sprite(0, -Consts.Unit * i, 'items', 13 + content)
                .setInteractive();

            sprite.on('pointerdown', me._onReserveClick, me);

            me._reserve.push({
                sprite: sprite,
                content: content
            });
        }

        me._container = scene.add.container(x, y, me._reserve.map(r => r.sprite))
            .setDepth(Consts.Depth.UI);

        me.emitter = new Phaser.Events.EventEmitter();
    }

    getSoilderCount() {
        const me = this;

        const index = Utils.lastIndexOrNull(
            me._reserve, 
            r => r.content == Enums.Reserve.Soilder)

        return index != null;
    }

    spawn() {
        const me = this;

        const index = Utils.lastIndexOrNull(
            me._reserve, 
            r => r.content == Enums.Reserve.Soilder);

        me._reserve[index].sprite.setFrame(13 + Enums.Reserve.OpenCoffin);
        me._reserve[index].content = Enums.Reserve.OpenCoffin;
    }

    /**
     * @param {Corpse} corpse 
     * @param {Function} callback 
     * @param {Object} scope 
     */
    fillCoffin(corpse, callback, scope) {
        const me = this;

        const index = Utils.lastIndexOrNull(
            me._reserve, 
            r => r.content == Enums.Reserve.OpenCoffin);

        const target = Utils.buildPoint(
            me._container.x + me._reserve[index].sprite.x,
            me._container.y + me._reserve[index].sprite.y);
            
        corpse.hideShadow();

        me._scene.add.tween({
            targets: corpse.toGameObject(),
            x: target.x,
            y: target.y,
            duration: Consts.Speed.Reserve,
            ease: 'Sine.easeInOut',
            onComplete: () => {

                me._reserve[index].content = Enums.Reserve.ClosedCoffin;
                me._reserve[index].sprite.setFrame(13 + Enums.Reserve.ClosedCoffin);
                corpse.hide();
                
                callback.call(scope, corpse)
            }
        });
    }

    addSoldier(citizen, callback, scope) {
        const me = this;

        const index = Utils.lastIndexOrNull(
            me._reserve, 
            r => r.content == Enums.Reserve.Empty);

        const target = Utils.buildPoint(
            me._container.x + me._reserve[index].sprite.x,
            me._container.y + me._reserve[index].sprite.y);

        me._scene.add.tween({
            targets: citizen.toGameObject(),
            x: target.x,
            y: target.y,
            duration: Consts.Speed.Reserve,
            ease: 'Sine.easeInOut',
            onComplete: () => {

                me._reserve[index].content = Enums.Reserve.Soilder;
                me._reserve[index].sprite.setFrame(13 + Enums.Reserve.Soilder);
                
                callback.call(scope, citizen)
            }
        })
    }

    hasEmptyPlace() {
        const me = this;

        const index = Utils.lastIndexOrNull(
            me._reserve,
            r => r.content == Enums.Reserve.Empty);

        return index != null;
    }

    removeCoffin() {
        const me = this;

        const index = Utils.lastIndexOrNull(
            me._reserve,
            r => r.content == Enums.Reserve.ClosedCoffin);

        me._reserve[index].content = Enums.Reserve.Empty;
        me._reserve[index].sprite.setFrame(13 + Enums.Reserve.Empty);

        return Utils.buildPoint(
            me._container.x,
            me._container.y - index * Consts.Unit
        );
    }

    shift(isCity) {
        const me = this;

        if (isCity)
            me._container.setX(-Consts.Viewport.Width + me._x);
        else
            me._container.setX(me._x);
    }

    _onReserveClick() {
        const me = this;

        const target = me._status.isCity
            ? Enums.Reserve.ClosedCoffin
            : Enums.Reserve.OpenCoffin;

        const index = Utils.lastIndexOrNull(
            me._reserve,
            r => r.content == target);

        if (index == null)
            return;

        me.emitter.emit('coffinClick');
    }
}