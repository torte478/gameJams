import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';
import Keyboard from './Keyboard.js';

export default class Player {

    /** @type {Phaser.GameObjects.Sprite} */
    body;

    /** @type {Phaser.GameObjects.Sprite} */
    hands;

    /** @type {Phaser.GameObjects.Container} */
    container;

    /** @type {Keyboard} */
    keyboard;

    /** @type {Boolean} */
    busy = false;

    /** @type {Number} */
    handsFrame = Consts.playerHandState.KEY;

    /** @type {time} */
    desertStartTime = null;

    /** @type {Phaser.Scene} */
    scene;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Geom.Point} point
     * @param {Phaser.GameObjects.Sprite} body 
     * @param {Phaser.GameObjects.Sprite} hands 
     * @param {Keyboard} keyboard
     */
    constructor(scene, pos, body, hands, keyboard) {
        const me = this;

        me.body = body;
        me.hands = hands;
        me.keyboard = keyboard;
        me.scene = scene;

        me.container = scene.add.container(pos.x, pos.y, [ body, hands]);
        me.container.setSize(body.width, body.height);
        scene.physics.world.enable(me.container);

        scene.anims.create({
            key: 'player_walk',
            frames: scene.anims.generateFrameNumbers('player', { frames: [0, 1, 2, 3, 2, 1 ] }),
            frameRate: 5,
            repeat: -1
        });

        scene.anims.create({
            key: 'player_carrot',
            frames: scene.anims.generateFrameNumbers('player', { frames: [4, 5 ] }),
            frameRate: 5,
            repeat: 4,
        });

        scene.anims.create({
            key: 'player_walk_desert',
            frames: scene.anims.generateFrameNumbers('player', { frames: [6, 7 ] }),
            frameRate: 2,
            repeat: -1,
        });

        me.body.on(Phaser.Animations.Events.ANIMATION_COMPLETE, me.onAnimationComplete, me);

        me.body.play('player_walk');
        me.take(me.handsFrame);
    }

    update() {
        const me = this;

        const inDesert = me.handsFrame !== Consts.playerHandState.DONKEY
            &&  me.container.y > -13728 
            && me.container.y < -5760;

        if (inDesert) {
            if (me.desertStartTime === null) {
                me.desertStartTime = new Date().getTime();
                me.body.play('player_walk_desert');
            }
        } else {
            if (me.desertStartTime !== null) {
                me.desertStartTime = null;
                me.body.play('player_walk');
            }
        }

        if (me.busy) {
            return;
        }
    
        let sign = {
            x: 0,
            y: 0
        };

        if (me.keyboard.isPressed(Phaser.Input.Keyboard.KeyCodes.UP)) 
            sign.y = -1;
        else if (me.keyboard.isPressed(Phaser.Input.Keyboard.KeyCodes.DOWN)) 
            sign.y = 1;

        if (me.keyboard.isPressed(Phaser.Input.Keyboard.KeyCodes.LEFT)) 
            sign.x = -1;
        else if (me.keyboard.isPressed(Phaser.Input.Keyboard.KeyCodes.RIGHT)) 
            sign.x = 1;

        let velocity = Consts.donkeyVelocity;
        if (me.handsFrame !== Consts.playerHandState.DONKEY) {
            velocity = Consts.playerVelocity;
            if (me.desertStartTime !== null) {
                const time = Math.min(10, (new Date().getTime() - me.desertStartTime) / 1000);
                const factor = 1 - time * 0.8 / 10;
                velocity = factor * velocity;
            }
        } 

        me.container.body.setVelocity(
            sign.x * velocity, 
            sign.y * velocity);
    }

    /**
     * 
     * @param {Phaser.Animations.Animation} animation 
     */
    onAnimationComplete(animation) {
        const me = this;

        if (animation.key === 'player_carrot') {
            me.hands.setVisible(true);
            me.body.play('player_walk');
            me.take(Consts.playerHandState.CARROT);
            me.busy = false;
            me.scene.sound.play('sfx');
        }
    }

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    startKeepCarrot(x, y) {
        const me = this;

        me.container.setPosition(x, y - 10);

        me.hands.setVisible(false);
        me.body.play('player_carrot');
        me.busy = true;
    }

    take(frame) {
        const me = this;

        me.handsFrame = frame;
        me.hands.setFrame(me.handsFrame);
    }

    takeFromFloor(itemFrame) {
        const me = this;

        switch (itemFrame) {
            case Consts.itemsFrame.CARROT:
                me.take(Consts.playerHandState.CARROT);
                break;
            case Consts.itemsFrame.MONEY:
                me.take(Consts.playerHandState.MONEY);
                break;
            case Consts.itemsFrame.DONKEY:
                me.take(Consts.playerHandState.DONKEY);
                break;
            case Consts.itemsFrame.ICECREAM:
                me.take(Consts.playerHandState.ICECREAM);
                break;
            case Consts.itemsFrame.KEY:
                me.take(Consts.playerHandState.KEY);
                break;
        }
    }
}