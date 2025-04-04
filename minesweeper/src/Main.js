import Phaser from './lib/phaser.js';

import Consts from './game/Consts.js';
import Game from './scenes/Game.js';
import Start from './scenes/Start.js';

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: Consts.Viewport.Width,
    height: Consts.Viewport.Height,
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