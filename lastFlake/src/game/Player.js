import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';

export default class Player {

    /** @type {Phaser.Scene} */
    scene;

    /** @type {Phaser.GameObjects.Container} */
    container;

    /** @type {Phaser.GameObjects.Sprite} */
    sprite;

    /** @type {Phaser.GameObjects.Sprite} */
    itemSprite;

    /** @type {Boolean} */
    isBusy;

    /** @type {Boolean} */
    hasKey;

    /** @type {Number} */
    skinIndex;

    isEat;

    /**
     * @param {Phaser.Scene scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y, skinIndex) {
        const me = this;

        me.scene = scene;
        me.skinIndex = skinIndex;
        me.sprite = scene.add.sprite(0, 0, 'kids', 0);
        me.itemSprite = scene.add.sprite(0, -1.5 * Consts.unit, 'key')
            .setVisible(false);
        me.container = scene.add.container(x, y, [ me.sprite, me.itemSprite ]);
        me.container.setSize(me.sprite.width, me.sprite.height);
        scene.physics.world.enable(me.container);

        me.isEat = false;
        me.isBusy = false;
        me.hasKey = false;
    }

    move(dir) {
        const me = this;

        if (me.isBusy)
            return;

        let speed = Consts.player.speed;
        if (me.scene.rules.level >= 4)
            speed /= 2;

        me.container.body.setVelocityX(speed * dir);

        if (dir != 0) {
            me.sprite.play(`kid_${me.skinIndex}_walk`, true);
            me.sprite.flipX = dir < 0;
        }
        else {
            me.sprite.setFrame(me.skinIndex * Consts.skinOffset);
            me.sprite.stop();
        }
    }

    startEat() {
        const me = this;

        me.isBusy = true;
        me.isEat = true;
        me.sprite.stop();
        me.sprite.setTexture('kids', me.skinIndex * Consts.skinOffset + 2);
        me.container.body.setVelocityX(0);
    }

    stopBusy() {
        const me = this;

        me.isBusy = false;
        me.isEat = false;
        me.sprite.setTexture('kids', me.skinIndex * Consts.skinOffset);
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

    startHappy() {
        const me = this;

        me.sprite.play(`kid_${me.skinIndex}_knock`);
        me.container.body.setVelocityX(0);
        me.isBusy = true;
 
        me.scene.time.delayedCall(
            3000,
            () => { me.stopBusy() });
    }
}