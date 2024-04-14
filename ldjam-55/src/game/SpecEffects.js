import Here from "../framework/Here.js";

export default class SpecEffects {

    /** @type {Phaser.GameObjects.Group} */
    _pool;

    constructor() {
        const me = this;

        me._pool = Here._.add.group();
    }

    doBlood(x, y, isBig) {
        const me = this;

        const blood = me._pool.create(x, y, 'blood', 0).play('blood');
        if (!isBig)
            blood.setScale(0.5);

        blood.tween = Here._.tweens.add({
            targets: blood,
            x: blood.x,
            duration: 500,
            onComplete: () => {
                blood.tween = null;
                me._pool.killAndHide(blood);
            }
        })
    }

    addMoney(money) {
        const me = this;

        if (money <= 0)
            return;

        const frame = money == 1 ? 0 : (money == 100 ? 1 : 2);
        const sprite = me._pool.create(4245, 25, 'moneyEffect', frame);
        sprite.tween = Here._.tweens.add({
            targets: sprite,
            y: 125,
            duration: 1000,
            alpha: { from: 1, to: 0.5 },
            ease: 'Sine.easeIn',
            onComplete: () => {
                sprite.tween = null;
                me._pool.killAndHide(sprite);
            }
        });

        Here.Audio.play('income', { volume: 0.4 });
    }

    doDismorale() {
        const me = this;

        const sprite = me._pool.create(2200, 330, 'dismorale');
        sprite.tween = Here._.tweens.add({
            targets: sprite,
            y: 630,
            duration: 1500,
            alpha: { from: 1, to: 0.5 },
            ease: 'Sine.easeOut',
            onComplete: () => {
                sprite.tween = null;
                me._pool.killAndHide(sprite);
            }
        });

        Here.Audio.play('dismorale', { volume: 0.4 });
    }

    doSelect() {
        const me = this;

        Here.Audio.play('select', { volume: 0.5 });
    }
}