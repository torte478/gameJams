import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';

export default class Snow {

    /** @type {Phaser.Scene} */
    scene;

    /** @type {Number} */
    maxCount;

    /** @type {Phaser.GameObjects.Group} */
    flakes;

    /** @type {Phaser.Events.EventEmitter} */
    emitter;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} maxCount 
     */
    constructor(scene, maxCount) {
        const me = this;

        me.scene = scene;
        me.maxCount = maxCount;

        me.flakes = scene.physics.add.group();
        me.emitter = new Phaser.Events.EventEmitter();
    }

    update() {
        const me = this;

        me.flakes.getChildren().forEach((item) => {
            if (item.y > Consts.worldSize.height) {
                me.flakes.killAndHide(item);
            }
        })

        const alive = me.flakes.getChildren().filter((x) => x.active).length;

        if (alive >= me.maxCount)
            return;

        const pos = Phaser.Math.Between(100, 2900);

        if (Consts.debug)
            console.log(pos);
        
        /** @type {Phaser.Physics.Arcade.Sprite} */
        const flake = me.flakes.get(pos, 700, 'snowflake');
        
        flake
            .setActive(true)
            .setVisible(true)
            .setVelocityY(50);

        me.emitter.emit('flakeCreated', pos);

        // me.scene.tweens.add({
        //     targets: flake,
        //     y: {
        //         value: Consts.worldSize.height + Consts.unit,
        //         duration: 2000
        //     },
        //     x: {
        //         value: '+= 50',
        //         duration: 2000,
        //         yoyo: true,
        //         repeat: -1,
        //         ease: 'Quad.easeInOut'
        //     }
        // });
    }

    checkEat(x, y) {
        const me = this;

        const flakes = me.flakes
            .getChildren()
            .filter((flake) => flake.active 
                && Consts.triggerDistance > Phaser.Math.Distance.Between(
                    x, y, flake.x, flake.y))

        const flake = flakes && flakes[0];

        const eat = !!flake;

        if (eat) {
            me.flakes.killAndHide(flake);
        }

        return eat;
    }
}