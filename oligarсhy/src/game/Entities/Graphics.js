import Phaser from "../../lib/phaser.js";

import Config from "../Config.js";
import Consts from "../Consts.js";
import Utils from "../Utils.js";

export default class Graphics {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Image} */
    _darkFade;

    /** @type {Phaser.GameObjects.Image} */
    _lightFade;

    /** @type {Phaser.Tweens.Tween} */
    _fadeTween;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;

        me._darkFade = scene.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'fade_black')
            .setScrollFactor(0)
            .setDepth(Consts.Depth.Fade)
            .setVisible(false);

        me._lightFade = scene.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'fade_white')
            .setScrollFactor(0)
            .setDepth(Consts.Depth.Fade)
            .setVisible(false);
    }

    /**
     */
    showDarkFade() {
        const me = this;

        me._showFade(me._darkFade);
    }

    /**
     */
    showLightFade() {
        const me = this;

        me._showFade(me._lightFade);
    }

    _showFade(fade) {
        const me = this;

        if (Utils.isDebug(Config.Debug.IgnorePhaseFade))
            return;

        me._darkFade.setVisible(false);
        me._lightFade.setVisible(false);

        if (!!me._fadeTween)
            me._fadeTween.pause().remove();

        fade
            .setVisible(true)
            .setAlpha(1);

        me._fadeTween = me._scene.tweens.add({
            targets: fade,
            alpha: { from: 1, to: 0 },
            delay: Consts.Speed.PhaseChangeDelay,
            ease: 'Sine.easeInOut',
            duration: Consts.Speed.PhaseChangeDuration,
        });
    }
}