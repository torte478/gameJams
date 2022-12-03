import Config from './Config.js';
import Consts from './Consts.js';
import EnemyBehaviour from './EnemyBehaviour.js';
import Enums from './Enums.js';
import Utils from './utils/Utils.js';

export default class CircleBehaviour extends EnemyBehaviour {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.Geom.Circle} */
    _circle;

    /** @type {Phaser.Geom.Point} */
    _target;

    /** @type {Phaser.GameObjects.Graphics} */
    _graphics;

    /** @type {Number} */
    _color;

    constructor(scene, x, y, r, color) {
        super();
        const me = this;
        me._color = color;

        me._scene = scene;
        me._circle = new Phaser.Geom.Circle(x, y, r);

        // me._graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }});
    }

    /**
     * @param {Phaser.Physics.Arcade.Body} body
     */
    update(body) {
        const me = this;
        
        const distance = Phaser.Math.Distance.BetweenPoints(
            Utils.toPoint(body.gameObject),
            me._target);

        /** @type {Phaser.Physics.Arcade.Sprite} */
        const sprite = body.gameObject;
        sprite.setFlipX(body.velocity.x < 0);

        if (distance < 10) {
            me._target = me._circle.getRandomPoint();
            me._scene.physics.moveTo(body.gameObject, me._target.x, me._target.y, Config.Physics.CircleSpeed);
            return;
        }
    }

    /**
     * @param {Phaser.Physics.Arcade.Group} group
     * @param {Number} x
     * @param {Number} y
     */
    create(group, x, y) {
        const me = this;

        /** @type {Phaser.Physics.Arcade.Sprite} */
        const sprite = group.create(x, y, 'circle', 0)
            .setCircle(Consts.Unit / 2, 25, 25)
            .setCollideWorldBounds(true);
        
        const anim = me._color == Enums.CIRCLE_COLOR.BLUE
            ? 'circle_blue_fly'
            : me._color == Enums.CIRCLE_COLOR.RED
                ? 'circle_red_fly'
                : 'circle_yellow_fly';

        sprite.play(anim);

        me._target = me._circle.getRandomPoint();
        me._scene.physics.moveTo(sprite, me._target.x, me._target.y, Config.Physics.CircleSpeed);
        // me._graphics.strokeCircleShape(me._circle);

        return sprite;
    }

    getSize() {
        return Config.EnemySize[Enums.EnemyType.CIRCLE];
    }

    getType() {
        return Enums.EnemyType.CIRCLE;
    }
}
