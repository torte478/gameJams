import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';

export default class Game extends Phaser.Scene {

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.load.image('background', 'assets/background.png');
        me.load.image('sky', 'assets/sky.png');
    }

    create() {
        const me = this;

        me.add.image(Consts.viewSize.width / 2, Consts.viewSize.height / 2, 'sky').setScrollFactor(0);
        me.add.image(Consts.worldSize.width / 2, Consts.worldSize.height / 2, 'background');

        me.cameras.main.setScroll(1500, 800)
    }

    update() {
        const me = this;
    }
}