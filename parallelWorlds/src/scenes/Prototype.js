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

        me.add.image(500, 5, 'border');
        me.add.image(500, 300, 'border');
        me.add.image(500, 550, 'border');

        me._player = me.add.image(80, 450, 'sprite', 0);

        const time = 2000;

        me._bot0 = me.add.tween({
                targets: me.add.image(400, 225, 'sprite', 1),
                x: 900,
                yoyo: true,
                duration: time,
                repeat: -1
            })
            .setTimeScale(0.5);

        me._bot1 = me.add.tween({
            targets: me.add.image(400, 500, 'sprite', 1),
            x: 900,
            yoyo: true,
            duration: time,
            repeat: -1
        })
        .setTimeScale(1);

        me._bot2 = me.add.tween({
            targets: me.add.image(400, 750, 'sprite', 1),
            x: 900,
            yoyo: true,
            duration: time,
            repeat: -1
        })
        .setTimeScale(2);

        me.input.keyboard.on('keydown', e => {
            if (e.key == 'q') {
                if (me._dimIndex <= 0)
                    return;

                me._dimIndex -= 1;

                if (me._dimIndex == 0) {
                    me._player.setY(130);
                    me._bot0.setTimeScale(1);
                    me._bot1.setTimeScale(2);
                    me._bot2.setTimeScale(4);
                } else if (me._dimIndex == 1) {
                    me._player.setY(450);
                    me._bot0.setTimeScale(0.5);
                    me._bot1.setTimeScale(1);
                    me._bot2.setTimeScale(2);
                }
            }
            else if (e.key == 'e') {
                if (me._dimIndex >= 2)
                    return;

                me._dimIndex += 1;

                if (me._dimIndex == 2) {
                    me._player.setY(620);
                    me._bot0.setTimeScale(0.25);
                    me._bot1.setTimeScale(0.5);
                    me._bot2.setTimeScale(1);
                } else if (me._dimIndex == 1) {
                    me._player.setY(450);
                    me._bot0.setTimeScale(0.5);
                    me._bot1.setTimeScale(1);
                    me._bot2.setTimeScale(2);
                }
            }
        }, me);
    }

    update() {
        const me = this;

        me._logText.text = 
            `mse: ${me.input.activePointer.worldX} ${me.input.activePointer.worldY}`;
    }
}