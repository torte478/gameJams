import Phaser from '../lib/phaser.js';

export default class Game extends Phaser.Scene {

    constructor() {
        super('game');
    }

    preload() {
        const me = this;
    }

    create() {
        const me = this;

        console.log('Hello, world!');
    }

    update() {
        const me = this;
    }
}