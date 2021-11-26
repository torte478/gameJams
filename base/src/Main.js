import Phaser from './lib/phaser.js';

import Game from './scenes/Game.js';

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
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