import Button from '../framework/Button.js';
import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Components from './Components.js';
import Enums from './Enums.js';

export default class MoneyComponent {
    _consts = {
        zoom: 0.42,
        buttonsPos: Utils.buildPoint(2940, 15),
        incomes: [ 17, 18, 18, 18, 20, 20, 20, 25, 25, 40, 50, 100]
    }

    _state = {
        income: 0,
        isNoChangeActivated: false,
        isNoChangeActiveTo: new Date().getTime(),
    }

    /** @type {Components} */
    _components;

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    _camera;

    /** @type {Phaser.Events.EventEmitter} */
    _events;

    /** @type {Number} */
    _paymentIid = null;

    /** @type {Phaser.Geom.Point} */
    _center = Utils.buildPoint(3100, 85);

    /** @type {Phaser.GameObjects.Text} */
    _totalText;
    /** @type {Phaser.GameObjects.Text} */
    _costText;
    /** @type {Phaser.GameObjects.Text} */
    _currentText;

    _currentString = '0';

    constructor(events) {
        const me = this;

        me._events = events;

        me._camera = Here._.cameras.add(800, 0, 200, 200)
            .setZoom(me._consts.zoom)
            .setBackgroundColor('#D3EEE7')
            .centerOn(me._center.x, me._center.y);

        Here._.add.image(me._center.x, me._center.y, 'moneyBox');
        
        me._createButtons();
        me._totalText = Here._.add.text(3270, -90, '100¤', { fontSize: 30, fontStyle: 'italic bold', color: '#89582E'}).setOrigin(1, 0.5);
        me._costText = Here._.add.text(3270, -60, '- 17¤', { fontSize: 30, fontStyle: 'italic bold', color: '#89582E'}).setOrigin(1, 0.5);
        me._currentText = Here._.add.text(3270, -30, '= 0¤', { fontSize: 36, fontStyle: 'italic bold', color: '#89582E'}).setOrigin(1, 0.5);
        me._showText(false);

        me._events.on('paymentStart', me._onPaymentStart, me);
        me._events.on('componentActivated', me._onComponentActivated, me);
        me._events.on('stratagemSummon', me._onStratagemSummon, me);
    }

    update(delta) {
        const me = this;

        me._checkActivation();
        me._checkStratagem();
    }

    _onStratagemSummon(stratagem) {
        const me = this;

        if (stratagem == Enums.StratagemType.WITHOUT_CHANGE) {
            me._state.isNoChangeActivated = true;
            me._state.isNoChangeActiveTo = new Date().getTime() + 40 * 1000;
        };
    }

    _checkStratagem() {
        const me = this;

        const now = new Date().getTime();
        if (now >= me._state.isNoChangeActiveTo) 
            me._state.isNoChangeActivated = false;
    }

    _showText(visible) {
        const me = this;

        me._totalText.setVisible(visible);
        me._costText.setVisible(visible);
        me._currentText.setVisible(visible);
    }

    _createButtons() {
        const me = this;

        me._createButton(1, 0, 2);
        me._createButton(2, 1, 2);
        me._createButton(3, 2, 2);

        me._createButton(4, 0, 1);
        me._createButton(5, 1, 1);
        me._createButton(6, 2, 1);

        me._createButton(7, 0, 0);
        me._createButton(8, 1, 0);
        me._createButton(9, 2, 0);

        me._createButton(0, 3, 2);
        me._createButton(10, 3, 0);
        me._createButton(11, 3, 1);

        new Button({
            x: 3170,
            y: 250,
            texture: 'okButton',
            frameIdle: 0,
            tintSelected: 0x00ff00,
            tintPress: 0xff0000,
            callbackScope: me,
            callback: me._onOkButtonClick,
        });
    }

    _createButton(frame, x, y) {
        const me = this;

        new Button({
            x: me._consts.buttonsPos.x + 10 + x * 75 + 30,
            y: me._consts.buttonsPos.y + 10 + y * 65 + 30,
            texture: 'buttons',
            frameIdle: frame,
            tintSelected: 0x00ff00,
            tintPress: 0xff0000,
            callbackScope: me,
            callback: me._onButtonClick,
        });
    }

    _onOkButtonClick() {
        const me = this;

        me._completePayment();
    }

    _onButtonClick(sender) {
        const me = this;

        const frame = sender._sprite.frame.name;
        if (frame >= 0 && frame <= 9 && me._currentString.length < 6) {
            me._currentString = me._currentString == '0'
                ? frame + ''
                : me._currentString + frame;
        }

        if (frame == 10)
            me._currentString = '0';

        if (frame == 11)
            me._currentString = me._currentString.length <= 1
                ? '0'
                : me._currentString.substring(0, me._currentString.length - 1);

        me._currentText.setText(`= ${me._currentString}¤`);
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

    _onPaymentStart(iid) {
        const me = this;

        if (me._paymentIid != null)
            throw 'payment queue!!!';

        me._paymentIid = iid;

        me._state.income = me._state.isNoChangeActivated
            ? 17
            : Utils.getRandomEl(me._consts.incomes);

        me._totalText.setText(`${me._state.income}¤`);
        me._currentString = '0';
        me._currentText.setText(`= ${me._currentString}¤`);

        me._showText(true);
    }

    _completePayment() {
        const me = this;

        if (me._paymentIid == null)
            return;
        
        const iid = me._paymentIid;
        me._paymentIid = null;
        const money = 17;

        const current = Number(me._currentString);
        const success = me._state.income - money === current;

        me._events.emit('paymentComplete', iid, success);
        if (success)
            me._events.emit('moneyIncome', money);

        me._showText(false);
    }
}