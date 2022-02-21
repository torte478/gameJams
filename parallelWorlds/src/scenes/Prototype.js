import Consts from '../game/Consts.js';
import Phaser from '../lib/phaser.js';

export default class Prototype extends Phaser.Scene {

    _logText;

    /** @type {Phaser.GameObjects.Image} */
    _player;

    /** @type {Phaser.Tweens.Tween} */
    _bot0;

    /** @type {Phaser.Tweens.Tween} */
    _bot1;

    /** @type {Phaser.Tweens.Tween} */
    _bot2;

    _dimIndex = 1;

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    _cursors;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.load.spritesheet('sprite', 'assets/sprite.png',{ frameWidth: 50 });
        me.load.image('border', 'assets/border.png');
    }

    create() {
        const me = this;

        me._logText = me.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
            .setScrollFactor(0)
            .setDepth(9999);

        me._cursors = me.input.keyboard.createCursorKeys();

        const border = me.physics.add.staticGroup();
        border.create(500, 5, 'border');
        border.create(500, 300, 'border');
        border.create(500, 550, 'border');

        me._player = me.physics.add.image(80, 450, 'sprite', 0);
        me.physics.add.collider(border, me._player);

        const time = 4000;

        me._bot0 = me.add.tween({
                targets: me.add.image(100, 225, 'sprite', 1),
                x: 900,
                yoyo: true,
                duration: time,
                repeat: -1
            })
            .setTimeScale(0.25);

        me._bot1 = me.add.tween({
            targets: me.add.image(100, 500, 'sprite', 1),
            x: 900,
            yoyo: true,
            duration: time,
            repeat: -1
        })
        .setTimeScale(1);

        me._bot2 = me.add.tween({
            targets: me.add.image(100, 750, 'sprite', 1),
            x: 900,
            yoyo: true,
            duration: time,
            repeat: -1
        })
        .setTimeScale(4);

        me.input.keyboard.on('keydown', e => {

            if (e.key == '1') {
                me._player.setY(130);
                me._bot0.setTimeScale(1);
                me._bot1.setTimeScale(4);
                me._bot2.setTimeScale(8);
            }
            else if (e.key == '2') {
                me._player.setY(450);
                me._bot0.setTimeScale(0.25);
                me._bot1.setTimeScale(1);
                me._bot2.setTimeScale(4);
            }
            else if (e.key == '3') {
                me._player.setY(620);
                me._bot0.setTimeScale(1 / 8);
                me._bot1.setTimeScale(1 / 4);
                me._bot2.setTimeScale(1);
            }

            if (e.key == 'q') {
                if (me._dimIndex <= 0)
                    return;

                me._dimIndex -= 1;

                if (me._dimIndex == 0) {
                    me._player.setY(130);
                    me._bot0.setTimeScale(1);
                    me._bot1.setTimeScale(4);
                    me._bot2.setTimeScale(8);
                } else if (me._dimIndex == 1) {
                    me._player.setY(450);
                    me._bot0.setTimeScale(0.25);
                    me._bot1.setTimeScale(1);
                    me._bot2.setTimeScale(4);
                }
            }
            else if (e.key == 'e') {
                if (me._dimIndex >= 2)
                    return;

                me._dimIndex += 1;

                if (me._dimIndex == 2) {
                    me._player.setY(620);
                    me._bot0.setTimeScale(1 / 8);
                    me._bot1.setTimeScale(1 / 4);
                    me._bot2.setTimeScale(1);
                } else if (me._dimIndex == 1) {
                    me._player.setY(450);
                    me._bot0.setTimeScale(0.25);
                    me._bot1.setTimeScale(1);
                    me._bot2.setTimeScale(4);
                }
            }
        }, me);
    }

    update() {
        const me = this;

        me._logText.text = 
            `mse: ${me.input.activePointer.worldX} ${me.input.activePointer.worldY}`;

        const speed = 320;

        if (me._cursors.left.isDown)
            me._player.setVelocityX(-speed);
        else if (me._cursors.right.isDown)
            me._player.setVelocityX(speed);
        else 
            me._player.setVelocityX(0);

        if (me._cursors.up.isDown)
            me._player.setVelocityY(-speed);
        else if (me._cursors.down.isDown)
            me._player.setVelocityY(speed);
        else 
            me._player.setVelocityY(0);
    }
}