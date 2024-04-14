import Button from '../framework/Button.js';
import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Components from './Components.js';
import Enums from './Enums.js';

export default class MoneyComponent {
    _consts = {
        zoom: 0.42,
    }

    _state = {
        
    }

    /** @type {Components} */
    _components;

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    _camera;

    /** @type {Phaser.Events.EventEmitter} */
    _events;

    /** @type {Number[]} */
    _paymentQueue = [];

    /** @type {Phaser.Geom.Point} */
    _center = Utils.buildPoint(3100, 85)

    constructor(events) {
        const me = this;

        me._events = events;

        me._camera = Here._.cameras.add(800, 0, 200, 200)
            .setZoom(me._consts.zoom)
            .setBackgroundColor('#d9a066')
            .centerOn(me._center.x, me._center.y);

        Here._.add.image(me._center.x, me._center.y, 'moneyBox');

        new Button({
            x: 3100,
            y: 90,
            texture: 'bus',
            frameIdle: 0,
            frameSelected: 0,
            text: 'PAY',
            textStyle: { fontSize: 32 },
            callbackScope: me,
            callback: () => {
                me._completePayment();
            }
        });

        me._events.on('paymentStart', me._onPaymentStart, me);
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

        if (me._state.isActive != isActive && isActive)
            me._events.emit('componentActivated', Enums.Components.MONEY);

        me._state.isActive = isActive;
    }

    _onComponentActivated(component) {
        const me = this;

        if (component == Enums.Components.MONEY)
            me._resizeComponent(600, 400, 450, 1);

        if (component == Enums.Components.ROAD)
            me._resizeComponent(800, 200, 200, me._consts.zoom);

        if (component == Enums.Components.INTERIOR)
            me._resizeComponent(600, 400, 200, me._consts.zoom);
    }

    _resizeComponent(x, width, height, zoom) {
        const me = this;

        if (!!me._resizeTween)
            me._resizeTween.stop();

        const percentage = Math.abs(width, me._camera.width) / width;

        me._resizeTween = Here._.add.tween({
            targets: me._camera,
            x: x,
            width: width,
            height: height,
            zoom: zoom,
            duration: 1000 * percentage,
            ease: 'Sine.easeOut',
            onUpdate: () => me._camera.centerOn(me._center.x, me._center.y)
        });
    }

    _onPaymentStart(index) {
        const me = this;

        me._paymentQueue.push(index);
    }

    _completePayment() {
        const me = this;

        if (me._paymentQueue.length == 0)
            return;
        
        const index = me._paymentQueue.shift();
        const money = Utils.getRandom(10, 100);
        me._events.emit('paymentComplete', index);
        me._events.emit('moneyIncome', money);
    }
}