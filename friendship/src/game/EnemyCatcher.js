import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Audio from './utils/Audio.js';
import Utils from './utils/Utils.js';

export default class EnemyCatcher {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.Geom.Rectangle} */
    _zone;

    /** @type {Phaser.Geom.Point} */
    _pos;

    /** @type {Number[]} */
    _stat;

    /** @type {Audio} */
    _audio;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Phaser.Geom.Rectangle} zone
     * 
     */
    constructor(scene, x, y, zone, laser, audio) {
        const me = this;

        me._scene = scene;
        me._zone = zone;
        me._pos = Utils.buildPoint(x, y);
        me._laser = laser;

        me._stat = [0, 0, 0];

        me._audio = audio;

        scene.add.sprite(x, y, 'enemy_catcher')
            .setDepth(Consts.Depth.HubTop)
            .play('enemy_catcher');

        // scene.add.rectangle(
        //     zone.x + (zone.width / 2), 
        //     zone.y + (zone.height / 2), 
        //     zone.width, 
        //     zone.height)
        //     .setStrokeStyle(2, 0xffff00);
    }

    update() {
        const me = this;

        const colliders = me._scene.physics.overlapRect(me._zone.x, me._zone.y, me._zone.width, me._zone.height, true)
            .filter(c => !!c.gameObject.isMovable 
                         && c.gameObject.owner._size > 0
                         && !c.gameObject.owner._isCatchedByCatcher);

        for (let i = 0; i < colliders.length; ++i) {
            /** @type {Phaser.Physics.Arcade.Body} */
            const body = colliders[i];
            const type = body.gameObject.owner.getType();
            const size = body.gameObject.owner._size;
            body.gameObject.owner.startCatchByCatcher(me._pos.x + 50, me._pos.y, () => me._onCatch(type, size), me);
            me._laser.checkHide(body.gameObject);
        }
    }

    getStat() {
        const me = this;

        return me._stat;
    }

    _onCatch(type, size) {
        const me = this;

        const value = type == Enums.EnemyType.CIRCLE ? size : 1;
        me._stat[type] += value;

        me._audio.play('enemy_catched');

        const rect = new Phaser.Geom.Rectangle(2190, 1400, 2620 - 2190, 1500 - 1400);
        const sprite = type == Enums.EnemyType.CIRCLE 
            ? 'circle'
            : type == Enums.EnemyType.SQUARE
                ? 'square'
                : 'triangle';

        const image = me._scene.add.image(2700, 1450, sprite, 0).setDepth(Consts.Depth.Hub + 10);
        const tweens = [];
        for (let i = 0; i < 4; ++i) {
            const point = rect.getRandomPoint();
            tweens.push({
                x: point.x,
                y: point.y,
                duration: 4000
            });
        };

        me._scene.tweens.timeline({
            targets: image,
            yoyo: true,
            repeat: -1,
            tweens: tweens});
    }
}