import Phaser from './lib/phaser.js';

import Game from './scenes/Game.js';

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 1000,
    height: 800,
    scene: [ 
        Game
        ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
});