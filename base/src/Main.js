import Phaser from './lib/phaser.js';

import Consts from './game/Consts.js';
import Game from './scenes/Game.js';

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: Consts.Viewport.Width,
    height: Consts.Viewport.Height,
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