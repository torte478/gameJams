import Button from '../framework/Button.js';
import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Components from './Components.js';
import Enums from './Enums.js';

export default class MoneyComponent {
    _consts = {
        
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

    constructor(events) {
        const me = this;

        me._events = events;

        me._camera = Here._.cameras.add(800, 0, 200, 200).setScroll(3000, 0);

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
    }

    update(delta) {
        const me = this;
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
        me._events.emit('paymentComplete', index);
    }
}