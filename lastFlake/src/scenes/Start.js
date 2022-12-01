import Consts from '../game/Consts.js';
import Phaser from '../lib/phaser.js';

export default class Start extends Phaser.Scene {

    constructor() {
        super('start');
    }

    preload() {
        const me = this;

        me.load.image('start_screen', 'assets/start_screen.png');
        me.load.spritesheet('cat', 'assets/cat.png', {
            frameWidth: 200,
            frameHeight: 200
        });
        me.load.audio('idle', 'assets/idle.mp3');
    }

    create() {
        const me = this;

        me.add.image(500, 400, 'start_screen');
        
        me.anims.create({
            key: 'cat_idle',
            frames: me.anims.generateFrameNumbers('cat', { frames: [ 0, 1 ]}),
            frameRate: 1,
            repeat: -1
        });
        me.add.sprite(840, 545, 'cat')
            .play('cat_idle');

        me.add.text(270, 450, 'Press any button to start', { 
            fontSize: 32,
            backgroundColor: '#000'
        });

        if (!!Consts.playMusic)
            me.sound.play('idle', { volume: 0.4, loop: true });

        me.input.keyboard.on('keydown', () => {
            me.sound.stopAll();
            me.scene.start('game');
        });
    }
}