import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';
import MyGraphics from './MyGraphics.js';

export default class Seagull {

    /** @type {Phaser.GameObjects.Image} */
    _bigSprite;

    /** @type {Phaser.GameObjects.Sprite} */
    _smallSprite;

    /** @type {Boolean} */
    _isRunning;

    /** @type {Number} */
    _nextBigTimeMs;

    /** @type {Phaser.Tweens.Tween} */
    _smallAttackTween;

    /** @type {Boolean} */
    _isSmallAttacking;

    /** @type {Boolean} */
    _isAttackNow;

    /** @type {Phaser.Time.TimerEvent} */
    _damageTimeEvent;

    /** @type {Number} */
    _bigCurrentHp;

    /** @type {Number} */
    _bigMaxHp;

    constructor() {
        const me = this;

        me._bigSprite = Here._.add.image(0, Consts.Viewport.Height, 'seagull_big')
            .setDepth(Consts.Depth.SEAGULL_BIG)
            .setInteractive();

        me._bigSprite.on('pointerdown', me._onBigSpriteClick, me);

        me._smallSprite = Here._.add
            .sprite(- Consts.Viewport.Width/ 2 - 100, 0, 'seagul_small', 0)
            .play('seagull_fly');

        me._isRunning = false;
        me._nextBigTimeMs = -1;
        me._smallAttackTween = null;
        me._isSmallAttacking = false;
        me._isAttackNow = false;

        me._bigMaxHp = 5;
    }

    start() {
        const me = this;

        me._bigCurrentHp = me._bigMaxHp;
        me._nextBigTimeMs = me._getNextBigTime();
        me._isRunning = true;
    }

    stop() {
        const me = this;
        me._hideBig();
        me._hideSmall();

        me._isRunning = false;
        me._nextBigTimeMs = -1;
        me._isAttackNow = false;
    }

    update(playerPos, playerAttackedCallback, context) {
        const me = this;

        if (!me._isRunning)
            return;

        if (me._isAttackNow) {
            if (me._isSmallAttacking)
                me._processSmallAttack(playerPos, playerAttackedCallback, context);
            else
                me._processBigAttack();
        } else {
            // check start attack
            const now = new Date().getTime();
            if (now < me._nextBigTimeMs)
                return;

            me._nextBigTimeMs = -1;
            me._isAttackNow = true;

            me._isSmallAttacking = Utils.getRandom(0, 1, 1) == 0;
            if (!me._isSmallAttacking) {
                
                me._bigSprite.setPosition(0, Consts.Viewport.Height);
                Here._.tweens.add({
                    targets: me._bigSprite,
                    y: 0,
                    ease: 'sine.out',
                    duration: 1000
                });
            } else {
                me._smallSprite
                    .setPosition(-Consts.Viewport.Width / 2 - 100, 0)
                    .setFlipX(false);

                me._smallAttackTween = Here._.tweens.add({
                    targets: me._smallSprite,
                    x: 0,
                    y: -100,
                    duration: 1000,
                    ease: 'sine.out',
                    onComplete: () => {
                        me._smallAttackTween = null;
                    }
                });
            }
        }    
    }

    _processBigAttack() {
        const me = this;
    }

    _processSmallAttack(playerPos, playerAttackedCallback, context) {
        const me = this;

        if (me._smallAttackTween != null)
            return;

        me._smallSprite.setFlipX(playerPos.x < me._smallSprite.x);

        me._smallAttackTween = Here._.tweens.add({
            targets: me._smallSprite,
            x: playerPos.x,
            y: playerPos.y,
            duration: 500,
            delay: 500,
            yoyo: true,
            ease: 'sine.inout',
            onYoyo: () => {
                playerAttackedCallback.call(context);
            },
            onComplete: () => {
                me._smallAttackTween = null;
            }
        })
    }

    _hideBig() {
        const me = this;

        Here._.tweens.add({
            targets: me._bigSprite,
            y: Consts.Viewport.Height,
            ease: 'sine.in',
            duration: 1000,
            onComplete: () => {
                me._nextBigTimeMs = me._getNextBigTime()

                me._bigCurrentHp = me._bigMaxHp;
                me._isAttackNow = false;
            }
        });       
    }

    _hideSmall() {
        const me = this;

        if (me._smallAttackTween != null) {
            me._smallAttackTween.remove();
            me._smallAttackTween = null;
        }

        me._smallSprite.setFlipX(true);
        Here._.tweens.add({
            targets: me._smallSprite,
            x: -Consts.Viewport.Width / 2 - 100,
            ease: 'sine.in',
            duration: 1000,
            onComplete: () => {
                me._nextBigTimeMs = me._getNextBigTime()
            }
        });       
     }

    _getNextBigTime() {
        const me = this;

        return new Date().getTime() + Utils.getRandom(1000, 5000, 1000);
    }
    
    _onBigSpriteClick(pointer) {
        const me = this;

        if (me._bigCurrentHp < 0)
            return;

        if (!!me._damageTimeEvent) {
            me._damageTimeEvent.paused = true;
            me._damageTimeEvent.destroy();
        }

        me._bigCurrentHp -= 1;
        if (me._bigCurrentHp == 0)
            me._hideBig();

        MyGraphics.runMinusOne(
            Utils.buildPoint(pointer.worldX, pointer.worldY)
        );

        me._bigSprite.setTint(0xff0000);
        me._damageTimeEvent = Here._.time.delayedCall(
            100,
            () => {
                me._bigSprite.clearTint();
                me._damageTimeEvent = null;
            }
        );
    }
}