import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';
import MyGraphics from './MyGraphics.js';

export default class Clipboard {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.Tweens.Tween} */
    _toggleTween;

    /** @type {Boolean} */
    _isOpen;

    /** @type {Number} */
    _nextTrashTimeMs;

    /** @type {Phaser.GameObjects.Group} */
    _trashPool;

    /** @type {Number} */
    _currentTrashCount;

    /** @type {Boolean} */
    _isPoop;

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

        me._nextTrashTimeMs = me._getNextTrashTime();
        me._trashPool = Here._.add.group({
            createCallback: entity => {
                entity.setInteractive();
                entity.on('pointerdown', pointer => me._onSpotClick(pointer, entity), me);
            }
        });
        me._currentTrashCount = 0;
        me._isPoop = false;
    }

    init(isPoop) {
        const me = this;

        me._isPoop = !!isPoop;
    }

    toggle() {
        const me = this;

        const addTrash = 
            !me._toggleTween 
            && !me._isOpen 
            && new Date().getTime() > me._nextTrashTimeMs 
            && me._currentTrashCount < 20
            && me._isPoop;

        if (addTrash) {
            const trash = me._trashPool
                .get(
                    Utils.getRandom(-300, 245), 
                    Utils.getRandom(-220, 245), 
                    'trash', 0)
                .setAngle(Utils.getRandom(-179, 180))
                .setFlipX(Utils.getRandom(0, 1) == 0)
                .setVisible(true)
                .setAlpha(1)
                .setActive(true);

            me._container.add(trash);

            me._nextTrashTimeMs = me._getNextTrashTime();
            ++me._currentTrashCount;

            Here.Audio.play('seagull_pop');
        };

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

    _getNextTrashTime() {
        const me = this;

        return new Date().getTime() + Utils.getRandom(1000, 15000, 1000)
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     * @param {Phaser.GameObjects.Image} spot 
     */
    _onSpotClick(pointer, spot) {
        const me = this;

        MyGraphics.runMinusOne(
            Utils.buildPoint(pointer.worldX, pointer.worldY)
        );

        const nextAlpha = Math.max(0, spot.alpha - 0.4);
        if (nextAlpha <= 0)
            me._trashPool.killAndHide(spot);
        else
            spot.setAlpha(nextAlpha); 
    }
}