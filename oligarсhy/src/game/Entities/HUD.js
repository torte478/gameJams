import Phaser from '../../lib/phaser.js';

import Consts from '../Consts.js';
import Enums from '../Enums.js';

export default class HUD {

    /** @type {Phaser.GameObjects.GameObjectFactory} */
    _factory;

    /** @type {Phaser.GameObjects.Image} */
    _background;

    /** @type {Number} */
    _state;

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     */
    constructor(factory) {
        const me = this;

        me._factory = factory;
        
        me._background = factory.image(
                -Consts.Sizes.HUD.Width / 2, 
                Consts.Sizes.HUD.Height / 2, 
                'hud')
            .setScrollFactor(0)
            .setDepth(Consts.Depth.HUD);

        me._state = Enums.HudState.HIDDEN;
    }

    show() {
        const me = this;

        if (me._state != Enums.HudState.HIDDEN)
            return;

        me._state = Enums.HudState.MOVING;

        me._factory.tween({
            targets: me._background,
            x: Consts.Sizes.HUD.Width / 2,
            duration: 500,
            ease: 'Sine.easeOut',
            onComplete: () => {
                me._state = Enums.HudState.VISIBLE;
            }
        });
    }

    hide() {
        const me = this;

        if (me._state != Enums.HudState.VISIBLE)
            return;

        me._state = Enums.HudState.MOVING;

        me._factory.tween({
            targets: me._background,
            x: Consts.Sizes.HUD.Width / -2 ,
            duration: 500,
            ease: 'Sine.easeIn',
            onComplete: () => {
                me._state = Enums.HudState.HIDDEN;
            }
        });
    }
}