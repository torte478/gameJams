import Phaser from '../lib/phaser.js';
import Callback from './Callback.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Container from './Container.js';
import PlayerTrigger from './PlayerTrigger.js';
import Utils from './utils/Utils.js';

export default class ContainerSpawn {
    
    /** @type {Container[]} */
    static _containers = [];

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.Physics.Arcade.Group} */
    _group;

    /** @type {Phaser.Geom.Point} */
    _pos;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;
    
    /** @type {PlayerTrigger} */
    _trigger;

    /** @type {Boolean} */
    _canSpawn;

    _index;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Physics.Arcade.Group} group 
     * @param {Phaser.Geom.Point} pos 
     */
    constructor(scene, group, pos, controls, index) {
        const me = this;

        me._scene = scene;
        me._group = group;
        me._pos = pos;
        me._index = 0;

        me._canSpawn = false;

        me._sprite = scene.add.sprite(pos.x, pos.y, 'container_spawn', 0)
            .setDepth(Consts.Depth.HubTop);
        me._trigger = new PlayerTrigger(
            scene, 
            new Phaser.Geom.Rectangle(
                pos.x - 75,
                pos.y - 75,
                150,
                150
            ),
            controls,
            new Callback(() => console.log('enter'), me),
            new Callback(me.spawn, me),
            new Callback(() => console.log('exit'), me)
            );
    }

    update(delta) {
        const me = this;

        me._trigger.update();

        const colliders = me._scene.physics.overlapRect(me._pos.x - 75, me._pos.y - 150 - 75, 150, 300, true);
        const isFreeSpace = Utils.all(colliders, c => !c.gameObject.isMovable);
        me._canSpawn = isFreeSpace;
        me._sprite.setFrame(me._canSpawn ? 0 : 1);
            
        for (let i = 0; i < ContainerSpawn._containers.length; ++i) {
            const container = ContainerSpawn._containers[i];
            if (container.spawnIndex === me._index)
                container.update(delta);
        }
    }

    spawn() {
        const me = this;

        if (!me._canSpawn)
            return;

        me._tryDeleteRedundant();

        const container = new Container(me._scene, me._group, me._pos.x, me._pos.y);
        container._bodyContainer.setDepth(Consts.Depth.Hub);
        me._scene.tweens.add({
            targets: container._bodyContainer,
            y: me._pos.y - 200,
            duration: 1000,
            onComplete: () => { container._bodyContainer.setDepth(Consts.Depth.HubTop + 200)}
        });

        container.spawnIndex = me._index;
        ContainerSpawn._containers.push(container);
    }

    _tryDeleteRedundant() {
        const me = this;

        while (ContainerSpawn._containers.length >= Config.ContainerLimit) {
            const deleted = Utils.firstIndexOrNull(ContainerSpawn._containers, c => c.isFree());
            if (deleted === null)
                return;

            const container = ContainerSpawn._containers[deleted];
            container.backToPool();
            ContainerSpawn._containers = Utils.removeAt(ContainerSpawn._containers, deleted);
        }
    }
}