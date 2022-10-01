import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Utils from '../utils/Utils.js';
import Corpse from './Corpse.js';

export default class Reserve {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Object[]]} */
    _reserve;

    /** @type {Number} */
    _maxSize;

    /** @type {Phaser.Events.EventEmitter} */
    emitter;

    constructor(scene, x, y, startCount, maxSize) {
        const me = this;

        me._scene = scene;
        me._maxSize = maxSize;

        me._reserve = [];
        for (let i = 0; i < maxSize; ++i) {

            const content = i >= startCount
                ? Enums.Reserve.Empty
                : Enums.Reserve.Soilder;

            const sprite = scene.add.sprite(x, y - Consts.Unit * i, 'items', 13 + content)
                .setInteractive();

            sprite.on('pointerdown', me._onReserveClick, me);

            me._reserve.push({
                sprite: sprite,
                content: content
            });
        }

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

        const target = Utils.toPoint(me._reserve[index].sprite);
        corpse.hideShadow();

        me._scene.add.tween({
            targets: corpse.toGameObject(),
            x: target.x,
            y: target.y,
            duration: Utils.getTweenDuration(
                corpse.toPoint(),
                target,
                Consts.Speed.FillCoffin),
            ease: 'Sine.easeInOut',
            onComplete: () => {

                me._reserve[index].content = Enums.Reserve.ClosedCoffin;
                me._reserve[index].sprite.setFrame(13 + Enums.Reserve.ClosedCoffin);
                corpse.hide();
                
                callback.call(scope, corpse)
            }
        })
    }

    _onReserveClick() {
        const me = this;

        const index = Utils.lastIndexOrNull(
            me._reserve,
            r => r.content == Enums.Reserve.OpenCoffin);

        if (index == null)
            return;

        me.emitter.emit('coffinClick');
    }
}