import Phaser from "../../lib/phaser.js";

import Config from "../Config.js";
import Consts from "../Consts.js";
import Utils from "../Utils.js";

export default class Graphics {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Image} */
    _darkFade;

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
    }

    /**
     */
    showDarkFade() {
        const me = this;

        if (Utils.isDebug(Config.Debug.IgnorePhaseFade))
            return;

        me._darkFade
            .setVisible(true)
            .setAlpha(1);

        me._scene.tweens.add({
            targets: me._darkFade,
            alpha: { from: 1, to: 0 },
            delay: Consts.Speed.PhaseChangeDelay,
            ease: 'Sine.easeInOut',
            duration: Consts.Speed.PhaseChangeDuration
        });
    }
}