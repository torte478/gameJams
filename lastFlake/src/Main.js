import Phaser from './lib/phaser.js';

import Game from './scenes/Game.js';
import Start from './scenes/Start.js';

export default new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        width: 1000,
        height: 800,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [ 
        Start,
        Game
        ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
});