import Phaser from './lib/phaser.js';

import Consts from './game/Consts.js';
import Game from './scenes/Game.js';
import Prototype from './scenes/Prototype.js';

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: Consts.Viewport.Width + 500,
    height: Consts.Viewport.Height,
    scene: [ 
        Prototype
        ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
});