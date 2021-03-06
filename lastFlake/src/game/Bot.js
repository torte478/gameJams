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

    skinIndex;

    goToFight;
    attack;
    tempActualPos;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} level 
     */
    constructor(scene, x, level, skinIndex) {
        const me = this;

        me.scene = scene;

        const y = Utils.getYbyLevel(level);

        me.skinIndex = skinIndex;
        me.animName = `kid_${skinIndex}_walk`;
        me.sprite = scene.physics.add.sprite(x, y, me.animName)
            .play(me.animName);

        me.path = [];
        me.pathIndex = 0;
        me.actualTarget = null;
        me.damaged = false;
        me.goToFight = false;
        me.attack = false;
        me.tempActualPos = null;
    }

    update() {
        const me = this;

        if (me.damaged || Consts.botLock || me.attack)
            return;

        if (me.pathIndex >= me.path.length) {
            if (!!me.actualTarget) {
                me.findNewPath();
            }

            return;
        }

        if (me.goToFight) {
            const playerDist = Phaser.Math.Distance.Between(
                me.sprite.x + 50 * (me.sprite.flipX ? 1 : -1),
                me.sprite.y,
                me.scene.player.container.x,
                me.scene.player.container.y);

            if (playerDist < 50 && !me.scene.player.isBusy){
                me.attack = true;
                me.sprite.body.reset(me.sprite.x, me.sprite.y);
                me.sprite.stop();
                me.sprite.setFrame(me.skinIndex * Consts.skinOffset + 6);

                if (me.scene.rules.timer >= 0) {
                    me.scene.sound.play('hit');
                    me.scene.sound.play('punch');
                }

                me.scene.player.startDamage();

                me.scene.time.delayedCall(
                    500,
                    () => {
                        me.goToFight = false;
                        me.attack = false;
                        me.pathIndex = 1000;
                        me.actualTarget = me.tempActualPos;
                    }
                )
            }
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
            else if (!me.goToFight)
            {
                me.sprite.stop();
                me.sprite.setFrame(me.skinIndex * Consts.skinOffset + 2);

                if (me.scene.rules.timer > 0)
                    me.scene.sound.play(`mouth_${Phaser.Math.Between(0, 2)}`);
            }
            else {
                me.actualTarget = me.tempActualPos;
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
            Consts.botSpeed - 100 + Phaser.Math.Between(0, 100));
        
        me.sprite.play(me.animName);
        me.sprite.setFlip(target.x < me.sprite.x)
    }

    findNewPath() {
        const me = this;

        if (Phaser.Math.Between(0, 2) == 0) {
            me.goToFight = true;
            me.tempActualPos = me.actualTarget;
            me.actualTarget = Phaser.Math.Between(100, 2900);
        }

        const target = me.findTarget(me.actualTarget);
        const res = me.buildPath(me.actualTarget, target);

        if (res)
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
            return true;
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

        let counter = 0;

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

            ++counter;
        }
        while (minIndex < INF && counter < 1000);

        if (counter >= 1000)
            return false;

        const ver = [];
        let end = me.findEndIndex(target);
        if (end == -1)
            return false;

        ver.push(end);
        let weight = d[end];

        counter = 0;

        while (end != beginIndex && counter < 1000) {
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

            ++counter;
        }

        if (counter >= 1000)
            return false;

        for (let i = ver.length - 1; i >= 0; --i) {
            const point = Consts.graphPoints[ver[i]];
            me.path.push(new Phaser.Geom.Point(point.x, point.y));
        }

        me.path.push(new Phaser.Geom.Point(pos, me.path[me.path.length - 1].y));

        return true;
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
        me.sprite.setFrame(me.skinIndex * Consts.skinOffset + 5);
        me.sprite.body.reset(me.sprite.x, me.sprite.y);

        me.scene.time.delayedCall(
            5000,
            () => {
                me.damaged = false;
                if (me.pathIndex >= me.path.length)
                    me.sprite.setFrame(me.skinIndex * Consts.skinOffset + 2);
                else
                    me.startMovement();
            }
        )
    }
}