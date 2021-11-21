import Phaser from './lib/phaser.js';

import Game from './scenes/Game.js';
import GameOver from './scenes/GameOver.js';
import Start from './scenes/Start.js';

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    scene: [ 
        //Start,
        Game,
        GameOver
        ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
});