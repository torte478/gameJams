import Phaser from "../lib/phaser.js";

export default class GameOver extends Phaser.Scene {

    state = '';

    constructor() {
        super('game_over');
    }

    init(data) {
        const me = this;
        me.state = 'win'; // data;
    }

    preload() {
        const me = this;
        me.load.spritesheet('comics', 'assets/comics.png', {
            frameWidth: 512,
            frameHeight: 384
        });
        me.load.spritesheet('final', 'assets/final.png', {
            frameWidth: 512,
            frameHeight: 384
        });
    }

    create() {
        const me = this;

        me.input.keyboard.once('keydown-E', () => {
            me.scene.start('game');
        })

        
        if (me.state === 'secret') {
            me.createComics('comics', '');
        }
        else if (me.state === 'win') {
            me.createComics('final', 'You win!')
        }
        else {
            me.add.text(me.scale.width * 0.5, me.scale.height * 0.5, 'Game Over', { fontSize: 52 })
                .setOrigin(0.5);
            me.add.text(me.scale.width * 0.5, me.scale.height * 0.5, 'Press E to restart', { fontSize: 32 })
                .setOrigin(0.5);
        }
    }
    
    createComics(name, text) {
        const me = this;

        const duration = 2000;

        me.add.tween({
            targets:  me.add.sprite(256, 192, name, 0).setAlpha(0),
            props: {
                alpha: { value: 1, duration: duration }
            },
            onComplete: () => { 
                me.add.tween({
                    targets:  me.add.sprite(512 + 256, 192, name, 1).setAlpha(0),
                    props: {
                        alpha: { value: 1, duration: duration }
                    },
                    onComplete: () => {
                        me.add.tween({
                            targets:  me.add.sprite(256, 384 + 192, name, 2).setAlpha(0),
                            props: {
                                alpha: { value: 1, duration: duration }
                            },
                            onComplete: () => {
                                me.add.tween({
                                    targets:  me.add.sprite(512 + 256, 384 + 192, name, 3).setAlpha(0),
                                    props: {
                                        alpha: { value: 1, duration: duration }
                                    },
                                    onComplete: () => {
                                        me.add.text(me.scale.width * 0.5, me.scale.height * 0.5, text, { fontSize: 52 })
                                            .setOrigin(0.5);
                                        me.add.text(me.scale.width * 0.5, me.scale.height * 0.5 + 40, 'Press E to restart', { fontSize: 32 })
                                            .setOrigin(0.5);
                                    }
                                });        
                            }
                        });
                    }
                });
            }
        });
    }
}