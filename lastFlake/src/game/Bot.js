import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';
import Utils  from '../game/Utils.js';

export default class Bot {

    /** @type {Phaser.Scene} */
    scene;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    sprite;

    /** @type {Array} */
    path;
    pathIndex;

    actualTarget;

    animName;

    damaged;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} level 
     */
    constructor(scene, x, level, animName) {
        const me = this;

        me.scene = scene;

        const y = Utils.getYbyLevel(level);

        me.animName = animName;
        me.sprite = scene.physics.add.sprite(x, y, animName);

        me.path = [];
        me.pathIndex = 0;
        me.actualTarget = null;
        me.damaged = false;
    }

    update() {
        const me = this;

        if (me.damaged)
            return;

        if (me.pathIndex >= me.path.length) {
            if (!!me.actualTarget) {
                me.findNewPath();
            }

            return;
        }

        const next = me.path[me.pathIndex];
        const distance = Phaser.Math.Distance.Between(
            me.sprite.x,
            me.sprite.y,
            next.x,
            next.y);
        if (distance < 10) {
            me.sprite.body.reset(next.x, next.y);
            ++me.pathIndex;

            if (me.pathIndex < me.path.length) {
                me.startMovement();
            }
            else
            {
                me.sprite.stop();
                me.sprite.setFrame(7 + 2); // TODO
            }

            if (!!me.actualTarget) {
                me.findNewPath();
            }
        }
    }

    startMovement() {
        const me = this;

        const target = me.path[me.pathIndex];

        me.scene.physics.moveTo(
            me.sprite, 
            target.x,
            target.y, 
            Consts.botSpeed);
        
        me.sprite.play(me.animName);
        me.sprite.setFlip(target.x < me.sprite.x)
    }

    findNewPath() {
        const me = this;

        const target = me.findTarget(me.actualTarget);
        me.buildPath(me.actualTarget, target);
        me.actualTarget = null;
    }

    onFlakeCreated(pos) {
        const me = this;

        me.actualTarget = pos;
    }

    buildPath(pos, target) {
        const me = this;

        me.pathIndex = 0;

        me.path = [ new Phaser.Geom.Point(me.sprite.x, me.sprite.y) ];

        if (me.alreadyInZone(target)) {
            me.path.push(new Phaser.Geom.Point(pos, me.sprite.y));
            return;
        }

        const d = [],
              v = [];
        let temp = 0,
            minIndex = 0,
            min = 0;
        const INF = 10000;

        let beginIndex = me.findBeginIndex();

        for (let i = 0; i < Consts.graphPoints.length; ++i) {
            d.push(INF);
            v.push(1);
        }
        d[beginIndex] = 0;

        do {
            minIndex = INF;
            min = INF;

            for (let i = 0; i < Consts.graphPoints.length; ++i) {
                if (v[i] == 1 && d[i] < min) {
                    min = d[i];
                    minIndex = i;
                }
            }

            if (minIndex != INF) {
                for (let i = 0; i < Consts.graphPoints.length; ++i) {
                    if (Consts.graphLinks[minIndex][i] > 0) {
                        temp = min + Consts.graphLinks[minIndex][i];
                        if (temp < d[i]) {
                            d[i] = temp;
                        }
                    }
                }
                v[minIndex] = 0;
            }
        }
        while (minIndex < INF);

        const ver = [];
        let end = me.findEndIndex(target);

        ver.push(end);
        let weight = d[end];

        while (end != beginIndex) {
            for (let i = 0; i < Consts.graphPoints.length; ++i) {
                if (Consts.graphLinks[i][end] != 0) {
                    let temp = weight - Consts.graphLinks[i][end];
                    if (temp == d[i]) {
                        weight = temp;
                        end = i;
                        ver.push(i);
                    }
                }
            }
        }

        for (let i = ver.length - 1; i >= 0; --i) {
            const point = Consts.graphPoints[ver[i]];
            me.path.push(new Phaser.Geom.Point(point.x, point.y));
        }

        me.path.push(new Phaser.Geom.Point(pos, me.path[me.path.length - 1].y));
    }

    findEndIndex(target) {
        const me = this;

        let index = -1;
        let distance = 99999;
        const zoneY = Utils.getYbyLevel(target.level);

        for (let i = 0; i < Consts.graphPoints.length; ++i) {
            const point = Consts.graphPoints[i];
            const onLevel = Math.abs(zoneY - point.y) < Consts.unit;
            const dist = Math.abs(target.zone.in - point.x);
            if (onLevel && dist < distance) {
                index = i;
                distance = dist;
            }
        }

        return index;
    }

    findBeginIndex() {
        const me = this;
        let index = -1;
        let distance = 99999;

        for (let i = 0; i < Consts.graphPoints.length; ++i) {
            const point = Consts.graphPoints[i];
            const onLevel = Math.abs(me.sprite.y - point.y) < Consts.unit;
            const dist = Math.abs(me.sprite.x - point.x);
            if (onLevel && dist < distance) {
                index = i;
                distance = dist;
            }
        }

        return index;
    }

    alreadyInZone(target) {
        var me = this;

        return Math.abs(me.sprite.y - Utils.getYbyLevel(target.level)) < Consts.unit
               && me.sprite.x >= target.zone.from
               && me.sprite.x <= target.zone.to;
    }

    findTarget(pos) {
        const me = this;

        for (let i = 0; i < Consts.eatZones.length; ++i) {
            for (let j = 0; j < Consts.eatZones[i].length; ++j) {
                const zone = Consts.eatZones[i][j];
                if (pos > zone.from && pos < zone.to && Phaser.Math.Between(0, 1) == 1) {
                    return { zone: zone, level: i};
                }
            }
        }

        return { zone: Consts.eatZones[2][0], level: Consts.levelType.FLOOR };
    }

    tryElectricityDamage() {
        const me = this;

        if (me.damaged)
            return;

        me.damaged = true;
        me.sprite.stop();
        me.sprite.setFrame(7 + 5); //TODO
        me.sprite.body.reset(me.sprite.x, me.sprite.y);

        me.scene.time.delayedCall(
            5000,
            () => {
                me.damaged = false;
                if (me.pathIndex >= me.path.length)
                    me.sprite.setFrame(7 + 2); // TODO
                else
                    me.startMovement();
            }
        )
    }
}