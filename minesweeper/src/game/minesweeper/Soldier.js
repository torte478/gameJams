import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
import Helper from '../Helper.js';
import Utils from '../utils/Utils.js';

export default class Soldier {
    
    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Phaser.GameObjects.Sprite} */
    _parachute;

    /** @type {Phaser.GameObjects.Sprite} */
    _shadow;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x
     * @param {Number} y
     */
    constructor(scene, x, y) {
        const me = this;

        me._scene = scene;

        me._parachute = scene.add.sprite(-Consts.UnitSmall, -Consts.UnitSmall, 'items', 0)
            .setVisible(false);

        me._shadow = scene.add.sprite(0, Consts.Shadow.Offset, 'items', Consts.Shadow.Middle);

        me._sprite = scene.add.sprite(0, 0, 'soldiers', 0);
        me._container = scene.add.container(x, y, [ 
            me._parachute,
            me._shadow,
            me._sprite 
        ]);
    }

    /**
     * @param {Number} soldierIndex
     * @param {Number} cellIndex
     * @param {Phaser.Geom.Point} pos 
     * @param {Function} callback 
     * @param {Object} context 
     */
    spawn(soldierIndex, cellIndex, pos, callback, context) {
        const me = this;

        const startY = -Consts.Unit;
        me._container.setPosition(pos.x, startY);
        me._parachute
            .setVisible(true)
            .play('parachute');

        me._scene.add.tween({
            targets: me._container,
            y: pos.y,
            duration: Utils.getTweenDuration(
                Utils.toPoint(me._container),
                pos,
                Consts.Speed.Spawn),
            ease: 'Sine.easeOut',

            onUpdate: () => { Helper.updateShadow(
                me._shadow,
                pos.y,
                me._container.y,
                startY,
                Consts.Shadow.StartFrame,
                Consts.Shadow.Middle,
                Consts.Shadow.Offset)} ,

            onComplete: () => {
                me._parachute.stop();
                me._parachute.setVisible(false);

                me._shadow
                    .setFrame(Consts.Shadow.Middle)
                    .setPosition(0, Consts.Shadow.Offset);

                callback.call(context, soldierIndex, cellIndex);
            }
        });
    }

    dispose() {
        const me = this;

        me._container.destroy(false); //TODO
    }   

    toPoint() {
        const me = this;

        return Utils.toPoint(me._container);
    }
}