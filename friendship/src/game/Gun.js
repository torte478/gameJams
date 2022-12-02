import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Movable from './Movable.js';
import Utils from './utils/Utils.js';

export default class Gun {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Number} */
    _shots;

    /** @type {Phaser.GameObjects.Sprite} */
    _first;

    /** @type {Phaser.GameObjects.Sprite} */
    _second;

    /**
     * 
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;
        me._shots = 0;

        me._first = scene.add.sprite(0, 0, 'main', 1)
            .setDepth(Consts.Depth.Laser)
            .setVisible(false);

        me._second = scene.add.sprite(0, 0, 'main', 1)
            .setDepth(Consts.Depth.Laser)
            .setVisible(false);

        scene.input.on('pointerdown', (pointer) => me._shot(pointer.worldX, pointer.worldY), me);
    }

    _shot(x, y) {
        const me = this;

        me._shots += 1;

        if (me._shots === 1) {
            me._first
                .setPosition(x, y)
                .setVisible(true);
        } else if (me._shots === 2) {
            me._second
                .setPosition(x, y)
                .setVisible(true);

            const middle = Utils.buildPoint(
                (me._first.x + me._second.x) / 2,
                (me._first.y + me._second.y) / 2);

            const firstCircleBodies = me._scene.physics.overlapCirc(me._first.x, me._first.y, Consts.Unit / 2, true, true);
            const firstBody = Utils.firstOrNull(firstCircleBodies, b => !!b.gameObject.isMovable);

            if (!!firstBody) {
                /** @type {Movable} */
                const movable = firstBody.gameObject.owner;
                movable.moveTo(middle);
            }

            const secondCircleBodies = me._scene.physics.overlapCirc(me._second.x, me._second.y, Consts.Unit / 2, true, true);
            const secondBody = Utils.firstOrNull(secondCircleBodies, b => !!b.gameObject.isMovable);

            if (!!secondBody) {
                /** @type {Movable} */
                const movable = secondBody.gameObject.owner;
                movable.moveTo(middle);
            }
        }
        else {
            me._first.setVisible(false);
            me._second.setVisible(false);
            me._shots = 0;
        }
    }
}