import Phaser from "../lib/phaser.js";

export default class Start extends Phaser.Scene {

    constructor() {
        super('start');
    }

    preload() {
        const me = this;
        
    }

    create() {
        const me = this;

        me.input.keyboard.once('keydown-E', () => {
            me.scene.start('game');
        })

        me.add.text(me.scale.width * 0.5, me.scale.height * 0.5 - 128, '**cool background image**', { fontSize: 24 })
            .setOrigin(0.5);

        me.add.text(me.scale.width * 0.5, me.scale.height * 0.5, 'One Minute Story', { fontSize: 52 })
                .setOrigin(0.5);

        me.add.text(me.scale.width * 0.5, me.scale.height * 0.5 + 64, 'Press E to start', { fontSize: 32 })
            .setOrigin(0.5);

        me.add.text(me.scale.width * 0.5, me.scale.height * 0.5 + 256, 'Game will load in 30-50 sec... ', { fontSize: 24 })
            .setOrigin(0.5);
    }
}