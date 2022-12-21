import Phaser from '../lib/phaser.js';
import Callback from './Callback.js';
import Consts from './Consts.js';

export default class Graphics {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Image} */
    _fade;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;

        me._fade = scene.add.image(scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'fade')
            .setScrollFactor(0)
            .setDepth(Consts.Depth.Fade)
            .setAlpha(0);
    }

    /**
     * @param {Callback} onMiddle
     * @param {Callback} onEnd
     */
    runFade(onMiddle, onEnd) {
        const me = this;

        const fadeDuration = 1000;

        me._scene.tweens.timeline({
            targets: me._fade,
            tweens: [
                {
                    alpha: { from: 0, to: 1},
                    duration: fadeDuration,
                    ease: 'Sine.easeOut',
                    onComplete: () => { onMiddle.call() }
                },
                {
                    alpha: { from: 1, to: 0 },
                    duration: fadeDuration,
                    ease: 'Sine.easeOut',
                    onComplete: () => { onEnd.call() }
                }
            ]
        });
    }
}