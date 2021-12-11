import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';

export default class Player {

    /** @type {Phaser.GameObjects.Container} */
    container;

    /** @type {Phaser.GameObjects.Sprite} */
    sprite;

    /** @type {Phaser.GameObjects.Sprite} */
    itemSprite;

    /** @type {Boolean} */
    isEat;

    /** @type {Boolean} */
    hasKey;

    /**
     * @param {Phaser.Scene scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y) {
        const me = this;

        me.sprite = scene.add.sprite(0, 0, 'kids', 0);
        me.itemSprite = scene.add.sprite(0, -1.5 * Consts.unit, 'key')
            .setVisible(false);
        me.container = scene.add.container(x, y, [ me.sprite, me.itemSprite ]);
        me.container.setSize(me.sprite.width, me.sprite.height);
        scene.physics.world.enable(me.container);

        me.isEat = false;
        me.hasKey = false;
    }

    move(dir) {
        const me = this;

        me.container.body.setVelocityX(Consts.player.speed * dir);

        if (dir != 0) {
            me.sprite.play('kid_0_walk', true);
            me.sprite.flipX = dir < 0;
        }
        else {
            me.sprite.setFrame(0);
            me.sprite.stop();
        }
    }

    startEat() {
        const me = this;

        me.isEat = true;
        me.sprite.stop();
        me.sprite.setTexture('kids', 2);
        me.container.body.setVelocityX(0);
    }

    stopEat() {
        const me = this;

        me.isEat = false;
        me.sprite.setTexture('kids', 2);
    }

    hide() {
        const me = this;

        me.container.setVisible(false);
    }

    show() {
        const me = this;

        me.container.setVisible(true);
    }

    takeKey() {
        const me = this;

        me.itemSprite
            .play('key')
            .setVisible(true);

        me.hasKey = true;
    }

    throwKey() {
        const me = this;

        me.itemSprite.setVisible(false);
        me.hasKey = false;
    }
}