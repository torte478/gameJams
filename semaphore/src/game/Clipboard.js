import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';

export default class Clipboard {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.Tweens.Tween} */
    _toggleTween;

    /** @type {Boolean} */
    _isOpen;

    constructor() {
        const me = this;

        me._isOpen = false;

        const clipboard = Here._.add.image(0, 0, 'clipboard');
        const legend = Here._.add.image(0, 85, 'hints')
            .setAngle(3);

        me._container = Here._.add.container(0, Consts.Viewport.Height, [ 
            clipboard,
            legend
        ])
            .setDepth(Consts.Depth.CLIPBOARD);
    }

    toggle() {
        const me = this;

        if (!!me._toggleTween) {
            me._toggleTween.pause();
            me._toggleTween.remove();
        }

        const from = Utils.toPoint(me._container);
        const to = Utils.buildPoint(
            0,
            me._isOpen ? Consts.Viewport.Height : 0);

        me._isOpen = !me._isOpen;
        
        me._toggleTween = Here._.tweens.add({
            targets: me._container,
            y: to.y,
            ease: 'sine.inout',
            duration: Utils.getTweenDuration(from, to, 1600),
            onComplete: () => {
                me._toggleTween = null;
            }
        });
    }

    hide() {
        const me = this;

        if (me._isOpen)
            me.toggle();
    }
}