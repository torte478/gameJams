import Phaser from './lib/phaser.js';

import Consts from './game/Consts.js';
import Game from './scenes/Game.js';
import Config from './game/Config.js';

export default new Phaser.Game({
    type: Phaser.AUTO,

    width: Consts.Viewport.Width 
        + (Config.DebugCameras ? Consts.Viewport.Width / 2 : 0),

    height: Consts.Viewport.Height,

    scene: [ 
        Game
        ],

    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: Config.Physics.Gravity }
        }
    }
});