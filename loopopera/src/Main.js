import Phaser from './lib/phaser.js';

import Consts from './game/Consts.js';
import GameScene from './scenes/GameScene.js';

export default new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        width: Consts.Viewport.Width,
        height: Consts.Viewport.Height,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [ 
        GameScene
        ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    }
});