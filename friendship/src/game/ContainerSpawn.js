import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Container from './Container.js';
import Utils from './utils/Utils.js';

export default class ContainerSpawn {
    
    /** @type {Container[]} */
    _containers;

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.Physics.Arcade.Group} */
    _group;

    /** @type {Phaser.Geom.Point} */
    _pos;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Physics.Arcade.Group} group 
     * @param {Phaser.Geom.Point} pos 
     */
    constructor(scene, group, pos) {
        const me = this;

        me._scene = scene;
        me._group = group;
        me._pos = pos;
        me._containers = [];
    }

    update(delta) {
        const me = this;

        const colliders = me._scene.physics.overlapCirc(me._pos.x, me._pos.y, Consts.Unit * 1.5, true);
        const isFree = Utils.all(colliders, c => !c.gameObject.isMovable);
        if (isFree) {
            me._tryDeleteRedundant();
            me.spawn(me._pos.x, me._pos.y);
        }
            

        for (let i = 0; i < me._containers.length; ++i)
            me._containers[i].update(delta);
    }

    spawn(x, y) {
        const me = this;

        const container = new Container(me._scene, me._group, x, y);
        me._containers.push(container);
    }

    _tryDeleteRedundant() {
        const me = this;

        while (me._containers.length >= Config.ContainerLimit) {
            const deleted = Utils.firstIndexOrNull(me._containers, c => c.isFree());
            if (deleted === null)
                return;

            const container = me._containers[deleted];
            container.backToPool();
            me._containers = Utils.removeAt(me._containers, deleted);
        }
    }
}