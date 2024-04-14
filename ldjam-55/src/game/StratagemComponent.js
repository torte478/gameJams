import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Components from './Components.js';
import Enums from './Enums.js';
import Stratagem from './Stratagem.js';

export default class StratagemComponent {

    consts = {
        
    }

    state = {
        isActive: true,
        money: 0,
        arrowIndex: 0,
    }

    /** @type {Components} */
    _components;

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    _camera;

    /** @type {Phaser.Tweens.Tween} */
    _resizeTween;

    /** @type {Phaser.Events.EventEmitter} */
    _events;

    /** @type {Phaser.GameObjects.Text} */
    _totalText;

    /** @type {Stratagem[]} */
    _stratagems = [];

    constructor(events) {
        const me = this;

        me._events = events;

        me._camera = Here._.cameras.add(-200, 0, 300, 800)
            .setScroll(4000, 0)
            .setBackgroundColor('#007665');

        me._totalText = Here._.add.text(4295, 25, `${me.state.money}¤`, { fontSize: 28, fontStyle: 'bold'})
            .setOrigin(1, 0.5);

        const stratagemCount = 7;
        for (let i = 0; i < stratagemCount; ++i) {
            const stratagem = new Stratagem(i, me._events);
            me._stratagems.push(stratagem);
        }

        me._events.on('componentActivated', me._onComponentActivated, me);
        me._events.on('stratagemSummon', me._onStratagemSummon, me);
        me._events.on('moneyIncome', me._onMoneyIncome, me);
    }

    update(delta) {
        const me = this;

        me._checkActivation();
        me._updateControls();
        me._updateStratagems();
    }

    _onStratagemSummon(stratagem) {
        const me = this;

        me._onMoneyIncome(-me._stratagems[stratagem]._cost);
        me._resetStratagems();
    }

    _updateStratagems() {
        const me = this;

        for (let i = 0; i < me._stratagems.length; ++i)
            me._stratagems[i].updateTimer(me.state.money);
    }

    _updateControls() {
        const me = this;

        if (!me.state.isActive)
            return;

        const arrow = me._getArrowFromControl();
        if (arrow == null)
            return;

        let result = Enums.StratagemResult.MISS;
        for (let i = 0; i < me._stratagems.length; ++i) {
            const stratagem = me._stratagems[i];
            if (!stratagem.isAvaialbe())
                continue;

            result = Math.max(result, stratagem.updateArrow(me.state.arrowIndex, arrow));

            if (result == Enums.StratagemResult.COMPLETE)
                break;
        }

        if (result == Enums.StratagemResult.MISS)
            me._resetStratagems();
        else if (result == Enums.StratagemResult.HIT)
            me.state.arrowIndex += 1;
    }

    _resetStratagems() {
        const me = this;

        for (let i = 0; i < me._stratagems.length; ++i)
            me._stratagems[i].reset(me.state.money);

        me.state.arrowIndex = 0;
    }

    _getArrowFromControl() {
        const me = this;

        if (Here.Controls.isPressedOnce(Enums.Keyboard.UP))
            return Enums.Arrow.UP;

        if (Here.Controls.isPressedOnce(Enums.Keyboard.DOWN))
            return Enums.Arrow.DOWN;

        if (Here.Controls.isPressedOnce(Enums.Keyboard.LEFT))
            return Enums.Arrow.LEFT;

        if (Here.Controls.isPressedOnce(Enums.Keyboard.RIGHT))
            return Enums.Arrow.RIGHT;

        return null;
    }

    _onMoneyIncome(money) {
        const me = this;

        me.state.money += money;
        me._totalText.setText(`${me.state.money}¤`);
    }

    _checkActivation() {
        const me = this;

        const isActive = Phaser.Geom.Rectangle.Contains(
            new Phaser.Geom.Rectangle(me._camera.x, me._camera.y, me._camera.width, me._camera.height),
            Here._.input.activePointer.x,
            Here._.input.activePointer.y);

        if (me.state.isActive != isActive && isActive)
            me._events.emit('componentActivated', Enums.Components.STRATEGEM);

        me.state.isActive = isActive;
    }

    _onComponentActivated(component) {
        const me = this;

        if (component == Enums.Components.STRATEGEM)
            me._resizeComponent(0);
        else {
            me._resizeComponent(-200);
            me._resetStratagems(me.state.money);
        }
    }

    _resizeComponent(x) {
        const me = this;

        if (!!me._resizeTween)
            me._resizeTween.stop();

        const percentage = Math.abs(x - me._camera.x) / 200;

        me._resizeTween = Here._.add.tween({
            targets: me._camera,
            x: x,
            duration: 1000 * percentage,
            ease: 'Sine.easeOut',
        });
    }
}