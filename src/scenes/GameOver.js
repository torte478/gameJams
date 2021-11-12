import Phaser from "../lib/phaser.js";

export default class GameOver extends Phaser.Scene {
    constructor() {
        super('game_over');
    }

    create() {
        const me = this;

        me.add.text(me.scale.width * 0.5, me.scale.height * 0.5, 'Game Over', { fontSize: 52 })
            .setOrigin(0.5);

        me.input.keyboard.once('keydown-SPACE', () => {
            me.scene.start('game');
        })
    }
}