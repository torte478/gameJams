import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';

export default class Game {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Phaser.GameObjects.Image} */
    _hand;

    constructor() {
        const me = this;

        Here._.cameras.main.setScroll(
            Consts.Viewport.Width / -2,
            Consts.Viewport.Height / -2
        );

        me._hand = Here._.add
            .image(0, 0, 'hand')
            .setOrigin(0, 0.5);

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });
    }

    update() {
        const me = this;

        const mouse = Here._.input.activePointer;

        const angle = Phaser.Math.RadToDeg(
            Phaser.Math.Angle.Between(
                me._hand.x,
                me._hand.y,
                mouse.worldX,
                mouse.worldY)
            );
        
        me._hand.setAngle(angle);

        if (Here.Controls.isPressed(Enums.Keyboard.RESTART) 
            && Utils.isDebug(Config.Debug.Global))
            Here._.scene.restart({ isRestart: true });

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            const mouse = Here._.input.activePointer;

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n`;

            me._log.setText(text);
        });
    }
}