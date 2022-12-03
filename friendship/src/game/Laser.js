import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';
import Utils from './utils/Utils.js';

export default class Laser {
    
    /** @type {Phaser.Physics.Arcade.Sprite[]} */
    _shots;

    /** @type {Phaser.GameObjects.PointLight[]} */
    _nodes;

    /** @type {Phaser.GameObjects.PointLight[]} */
    _points;

    /** @type {Phaser.Physics.Arcade.Sprite[]} */
    _targets;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Physics.Arcade.Sprite} firstShot 
     * @param {Phaser.Physics.Arcade.Sprite} secondShot 
     */
    constructor(scene, firstShot, secondShot) {
        const me = this;

        me._shots = [ firstShot, secondShot ];
        me._nodes = [];
        for (let i = 0; i < 2; ++i) {
            // const node = scene.add.pointlight(3245, 1610, '0x00C4E9', 50, 0.50);
            const node = scene.add.pointlight(0, 0, '0x00C4E9', 50, 0.50)
                .setVisible(false)
                .setDepth(Consts.Depth.Laser);

            me._nodes.push(node)
        }

        me._points = [];
        for (let i = 0; i < 40; ++i) {
            const point = scene.add.pointlight(0, 0, '0x00C4E9', 25, 0.25)
                .setVisible(false)
                .setDepth(Consts.Depth.Laser);

            me._points.push(point);
        }

        me._targets = [ null, null ];
    }

    update(delta) {
        const me = this;

        const start = Utils.toPoint(me._targets[0] !== null ? me._targets[0] : me._shots[0]);
        const end = Utils.toPoint(me._targets[1] !== null ? me._targets[1] : me._shots[1]);

        me._nodes[0].setPosition(start.x, start.y);
        me._nodes[1].setPosition(end.x, end.y);

        let point = new Phaser.Geom.Point(0, 0);
        for (let i = 0; i < me._points.length; ++i) {
            const t = i / me._points.length;
            Phaser.Geom.Point.Interpolate(start, end, t, point);
            me._points[i].setPosition(point.x, point.y);
        }
    }

    setVisibleNode(i, visible) {
        const me = this;

        me._nodes[i].setVisible(visible);
        if (visible)
            me._nodes[i].setPosition(me._shots[i].x, me._shots[i].y);
    }

    setVisiblePoints(visible) {
        const me = this;

        me._points.forEach(n => n.setVisible(visible));
    }

    setTarget(index, target) {
        const me = this;

        me._targets[index] = target;
    }

    hide() {
        const me = this;

        me._nodes.forEach(x => x.setVisible(false));
        me._points.forEach(n => n.setVisible(false));
        me._targets = [ null, null ];
    }

    checkHide(obj) {
        const me = this;

        if (me._targets[0] == obj || me._targets[1] == obj)
            me.hide();
    }
}