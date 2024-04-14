import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Components from './Components.js';
import Enums from './Enums.js';

export default class StratagemComponent {

    consts = {
        
    }

    state = {
        isActive: true,
    }

    /** @type {Components} */
    _components;

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    _camera;

    /** @type {Phaser.Tweens.Tween} */
    _resizeTween;

    /** @type {Phaser.Events.EventEmitter} */
    _events;

    constructor(events) {
        const me = this;

        me._events = events;

        me._camera = Here._.cameras.add(-200, 0, 300, 800)
            .setScroll(4000, 0);

        me._events.on('componentActivated', me._onComponentActivated, me);
    }

    update(delta) {
        const me = this;

        me._checkActivation();
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
        else
            me._resizeComponent(-200);
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