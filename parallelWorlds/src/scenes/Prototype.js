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

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    _cam1;

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    _cam2;

    _dimIndex = 1;

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    _cursors;

    _botIndex = 1;

    /** @type {Phaser.GameObjects.Image} */
    _fade;

    /** @type {Phaser.GameObjects.Group} */
    _ghosts;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.load.spritesheet('sprite', 'assets/sprite.png',{ frameWidth: 50 });
        me.load.image('border', 'assets/border.png');
        me.load.image('back', 'assets/back.png');
    }

    create() {
        const me = this;

        me._logText = me.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
            .setScrollFactor(0)
            .setDepth(9999)
            .setVisible(false);

        me.cameras.main.setSize(1000, 800);
        me._cam1 = me.cameras.add(1000, 0, 1000, 400)
            .setScroll(500, 800 + 200)
            .setZoom(0.5);
        me._cam2 = me.cameras.add(1000, 400, 1000, 400)
            .setScroll(500, 1600 + 200)
            .setZoom(0.5);

        me._ghosts = me.add.group();

        me.add.image(500, 400, 'back')
            .setDepth(-100)
            .setTint(0xe7e1e9);

        me.add.image(500, 400 + 800, 'back')
            .setDepth(-100)
            .setTint(0xc5ffdd);

        me.add.image(500, 400 + 1600, 'back')
            .setDepth(-100)
            .setTint(0xf7ffc9);

        me.add.text(10, 10, '1', { fontSize: 60, backgroundColor: '#000' });
        me.add.text(10, 800 + 10, '2', { fontSize: 60, backgroundColor: '#000' });
        me.add.text(10, 1600 + 10, '3', { fontSize: 60, backgroundColor: '#000' });

        me._cursors = me.input.keyboard.createCursorKeys();
        me._player = me.physics.add.image(80, 450 + 800, 'sprite', 0)
            .setDepth(1000);

        me._fade = me.add.image(500, 400, 'back')
            .setDepth(500);

        const time = 4000;

        me._bot0 = me.add.tween({
                targets: me.add.image(100, 225, 'sprite', 1).setVisible(false),
                x: 900,
                yoyo: true,
                duration: time,
                repeat: -1
            });

        me._bot1 = me.add.tween({
            targets: me.physics.add.image(100, 225 + 800, 'sprite', 1),
            x: 900,
            yoyo: true,
            duration: time,
            repeat: -1
        });

        me._bot2 = me.add.tween({
            targets: me.add.image(100, 225 + 800 + 800, 'sprite', 1).setVisible(false),
            x: 900,
            yoyo: true,
            duration: time,
            repeat: -1
        });

        const portals = me.physics.add.staticGroup();

        me.input.mouse.disableContextMenu();
        me.input.on('pointerdown', (p) => {
            /** @type {Phaser.Input.Pointer} */
            const pointer = p;
            
            portals.create(pointer.worldX, pointer.worldY, 'sprite', pointer.rightButtonDown() ? 3 : 4);
        }, me);

        me.physics.add.collider(me._player, portals, (plr, p) => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const ppp = p;
            me._goTo(p.frame.name != '3' ? me._dimIndex + 1 : me._dimIndex - 1);
            portals.killAndHide(ppp);
            ppp.destroy(); //TOOD
        });

        me.physics.add.collider(me._bot1.targets[0], portals, (b, p) => {

            me._botGoto(p.frame.name != '3' ? me._botIndex + 1 : me._botIndex - 1);

            portals.killAndHide(p);
            p.destroy(); //TOOD
        });

        me.input.keyboard.on('keydown', e => {

            if (e.key == 'p')
                me.scene.stop();

            if (e.key == '1') {
                me._goTo(0);
            }
            else if (e.key == '2') {
                me._goTo(1);
            }
            else if (e.key == '3') {
                me._goTo(2);
            }

            if (e.key == 'q') {
                if (me._dimIndex <= 0)
                    return;

                me._goTo(me._dimIndex - 1);
            }
            else if (e.key == 'e') {
                if (me._dimIndex >= 2)
                    return;

                me._goTo(me._dimIndex + 1);
            }
        }, me);

        me._goTo(1);
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

    _botGoto(index) {
        const me = this;

        const pos = me._bot1.targets[0].y % 800;
        me._botIndex = Math.min(2, Math.max(0, index));

        let scale = 1;
        if (me._dimIndex == 0) {
            if (me._botIndex == 0)
                scale = 1;
            else if (me._botIndex == 1)
                scale = 4;
            else
                scale = 8;
        }
        else if (me._dimIndex == 1) {
            if (me._botIndex == 0)
                scale = 1 / 4;
            else if (me._botIndex == 1)
                scale = 1;
            else
                scale = 1 * 4;
        }
        else {
            if (me._botIndex == 0)
                scale = 1 / 8;
            else if (me._botIndex == 1)
                scale = 1 / 4;
            else
                scale = 1;
        }

        me._bot1.setTimeScale(scale);
        me._bot1.targets[0].setY(pos + me._botIndex * 800);
    }

    _goTo(index) {
        const me = this;

        // me._fade
        //     .setAlpha(0)
        //     .setPosition(500, me._dimIndex * 800 + 400);

        const ghostPosY = me._bot1.targets[0].y % 800;
        const ghost = me._ghosts.create(me._bot1.targets[0].x, ghostPosY + me._dimIndex * 800, 'sprite', 1)
                .setDepth(1200);

        const targetIndex = Math.min(2, Math.max(0, index));
        const targetTimeScale = targetIndex == 0
            ? 4
            : targetIndex == 1
                ? 1
                : 1/ 4;

        me.tweens.add({
            targets: me._bot1,
            timeScale: { from: me._bot1.timeScale, to: targetTimeScale },
            duration: 2000
        });

        me.tweens.add({
            targets: me._fade,
            alpha: { from: 0, to : 1 },
            duration: 1000,
            onUpdate: () => {
                ghost.setX(me._bot1.targets[0].x);
            },
            onComplete: () => {
                me._dimIndex = Math.min(2, Math.max(0, index));

                const pos = me._player.y % 800;

                const ghostPosY = me._bot1.targets[0].y % 800;
                ghost.setY(ghostPosY + me._dimIndex * 800);


                if (me._dimIndex == 0) {
                    me._player.setY(pos);
                    // me._bot0.setTimeScale(1);
                    // me._bot1.setTimeScale(4);
                    // me._bot2.setTimeScale(8);
        
                    me.cameras.main.setScroll(0, 0);
                    me._cam1.setScroll(500, 800 + 200);
                    me._cam2.setScroll(500, 1600 + 200);
                } else if (me._dimIndex == 1) {
                    me._player.setY(800 + pos);
                    // me._bot0.setTimeScale(0.25);
                    // me._bot1.setTimeScale(1);
                    // me._bot2.setTimeScale(4);
        
                    me.cameras.main.setScroll(0, 800);
                    me._cam1.setScroll(500, 200);
                    me._cam2.setScroll(500, 1600 + 200);
                } else if (me._dimIndex == 2) {
                    me._player.setY(1600 + pos);
                    // me._bot0.setTimeScale(1 / 8);
                    // me._bot1.setTimeScale(1 / 4);
                    // me._bot2.setTimeScale(1);
        
                    me.cameras.main.setScroll(0, 1600);
                    me._cam1.setScroll(500, 200);
                    me._cam2.setScroll(500, 800 + 200);
                }

                me._fade.setPosition(500, me._dimIndex * 800 + 400);

                me.tweens.add({
                    targets: ghost,
                    duration: 2000,
                    alpha: { from: 0.5, to: 0 }
                });

                me.tweens.add({
                    targets: [ me._fade, ghost ],
                    alpha: { from: 1, to : 0 },
                    duration: 1000,
                    onUpdate: () => {
                        ghost.setX(me._bot1.targets[0].x);
                    },
                    onComplete: () => {
                        me._ghosts.killAndHide(ghost);
                    }
                });
            }
        });
    }
}