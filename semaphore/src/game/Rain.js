import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';

export default class Rain {

    /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
    _particles;

    /** @type {Phaser.GameObjects.Image} */
    _lightning;

    /** @type {Number} */
    _nextLightTimeMs;

    constructor() {
        const me = this;

        me._particles = Here._.add
            .particles('rain')
            .setDepth(Consts.Depth.RAIN)
            .createEmitter({
                on: false,
                speed: { min: 800, max: 1000},
                frame: [0, 1, 2, 3, 4],
                scale: { min: 0.25, max: 1 },
                angle: { min: 90, max: 100},
                lifespan: 1000,

                quantity: 10,

                emitZone: {
                    source: new Phaser.Geom.Rectangle(
                        - Consts.Viewport.Width / 2,
                        - Consts.Viewport.Height / 2 - 10,
                        Consts.Viewport.Width + 10,
                        10
                    )
                }
        });

        me._lightning = Here._.add.image(0, 0, 'fade_white')
            .setDepth(Consts.Depth.LIGHTNING)
            .setAlpha(0.5)
            .setVisible(false);
        me._nextLightTimeMs = -1;
    }

    start(isRain) {
        const me = this;

        if (!isRain)
            return;

        me._particles.on = true;

        me._nextLightTimeMs = me._getNextLightningTime();

        Here.Audio.playIfNotPlaying('rain', { loop: -1});
    }

    stop() {
        const me = this;

        me._particles.on = false;
        me._nextLightTimeMs = -1;

        Here.Audio.stop('rain');
    }

    update() {
        const me = this;
        
        const now = new Date().getTime();
        if (me._nextLightTimeMs > 0 && now > me._nextLightTimeMs) {
            me._nextLightTimeMs = me._getNextLightningTime();

            Here.Audio.play('lightning');

            Here._.time.addEvent({
                delay: 100,
                repeat: 3,
                callback: () => {
                    me._lightning.setVisible(!me._lightning.visible)
                }
            });
        }
    }

    _getNextLightningTime() {
        const now = new Date().getTime();
        return now + Utils.getRandom(3000, 12000, 1000);
    }
}