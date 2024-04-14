import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Components from './Components.js';
import Enums from './Enums.js';

export default class RoadComponent {

    _consts = {
        lowerBound: 1000,

        speedXChange: 50,

        maxSpeedY: 1000,
        speedYUpChange: 200,
        speedYDownChange: 400,

        busStopPrepare: 1000,
        busStopCreate: 1000,

        passengerSpeed: 100 * 3,

        startX: 575, //350,
        startY: 700,

        depth: {
            road: 0,
            busStop: 100,
            passengers: 200,
            lattern: 400,
            bus: 500,
        }
    }
    _state = {
        isActive: true,
        speed: 0,
        position: 0,
        delta: 0,
        status: Enums.BusStatus.ENTER
    }

    /** @type {Components} */
    _components;

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    _camera;

    /** @type {Phaser.Events.EventEmitter} */
    _events;

    /** @type {Phaser.GameObjects.Group} */
    _spritePool;

    /** @type {Phaser.GameObjects.Image} */
    _busStop;

    /** @type {Phaser.GameObjects.Image[]} */
    _passengers = [];

    /** @type {Phaser.Tweens.Tween} */
    _resizeTween;

    /** @type {Phaser.GameObjects.Sprite} */
    _smokeSprite;

    /** @type {Phaser.GameObjects.Text} */
    _signText;

    _signPanel;

    constructor(events) {
        const me = this;

        me._events = events;

        me._camera = Here._.cameras.main;
        me._camera.setViewport(0, 0, 700 - 20, 800).setPosition(110, 0).setScroll(0, 0);

        me._spritePool = Here._.add.group();
        me._roadTiles = [];
        for (let i = -6; i < 4; ++i){
            const tile = me._spritePool.create(350, 100 + i * 200, 'road')
            tile.setDepth(me._consts.depth.road);
            me._roadTiles.push(tile);
        }

        me._smokeSprite = Here._.add.sprite(0, 35, 'smoke').play('smoke').setOrigin(0.5, 0).setVisible(false);
        const busSprite = Here._.add.image(0, 0, 'bus');

        me._bus = Here._.add.container(me._consts.startX, me._consts.startY, [ me._smokeSprite, busSprite ])
            .setDepth(me._consts.depth.bus);
        Here._.physics.world.enable(me._bus);

        me._signPanel = Here._.add.image(65, 750, 'sign');
        me._signText = Here._.add.text(110, 750, '1000m', {fontSize: 24, fontStyle: 'bold'}).setOrigin(1, 0.5);

        me._events.on('componentActivated', me._onComponentActivated, me);
        me._events.on('exitComplete', me._onExitComplete, me);

        me._createBusStop(600);
    }

    update(delta) {
        const me = this;

        me._state.delta = delta;
        me._processControls();

        me._state.position += me._state.speed * me._state.delta;

        if (me._state.status == Enums.BusStatus.DEPARTURE
            && me._state.position >= me._consts.busStopPrepare)
            me._changeStatus(Enums.BusStatus.PREPARE_TO_EXIT);

        if (!me._busStop && me._state.position >= me._consts.busStopCreate)
            me._createBusStop(-610);

        me._processBusStop();
        me._shiftTiles();
        me._checkActivation();
        me._updateSign();
    }

    isStoppedInsideBusArea() {
        const me = this;

        if (!me._busStop)
            return false;

        if (!me._isStopped())
            return false;

        return me._bus.x >= 515 && Math.abs(me._bus.y - me._busStop.y) <= 300;
    }

    _updateSign() {
        const me = this;

        const distance = (me._consts.busStopCreate - me._state.position + 1000) / 100;
        const visible = distance > 0 && distance < 1000;
        me._signText.setVisible(visible);
        me._signPanel.setVisible(visible);
        me._signText.setText(`${distance|0}m`);
    }

    _isStopped() {
        const me = this;

        return Math.abs(me._state.speed) <= 0.01;
    }

    _onExitComplete() {
        const me = this;

        me._changeStatus(Enums.BusStatus.ENTER);
    }

    _createBusStop(busStopY) {
        const me = this;

        me._busStop = me._spritePool.create(595, busStopY, 'busStop').setDepth(me._consts.depth.busStop);
        me._busStop.lattern = me._spritePool.create(600, busStopY + 400, 'lattern').setDepth(me._consts.depth.lattern).play('lattern');

        let positions = Utils
            .buildArray(
                Utils.getRandom(3, 3, 24), 0)
            .map((_, i) => Utils.buildPoint(
                me._busStop.x + Math.floor(i / 12) * 50 + 10 + Utils.getRandom(0, 15),
                me._busStop.y  - (me._busStop.height / 2) + 25 + (i % 12 * 50) + Utils.getRandom(0, 10)));

        positions = Utils.shuffle(positions);

        const passengerCount = Utils.getRandom(1, 10, 12);
        for (let i = 0; i < passengerCount; ++i) {
            const passenger = me._spritePool.create(
                positions[i].x,
                positions[i].y,
                'passengerOutside')
                .setDepth(me._consts.depth.passengers);

            me._passengers.push(passenger);
        };
    }

    _checkActivation() {
        const me = this;

        const isActive = Phaser.Geom.Rectangle.Contains(
            new Phaser.Geom.Rectangle(me._camera.x, me._camera.y, me._camera.width, me._camera.height),
            Here._.input.activePointer.x,
            Here._.input.activePointer.y);

        if (me._state.isActive != isActive && isActive)
            me._events.emit('componentActivated', Enums.Components.ROAD);

        me._state.isActive = isActive;
    }

    _onComponentActivated(component) {
        const me = this;

        if (component == Enums.Components.ROAD)
            me._resizeComponent(110, 0, 0, 700 - 20, 1);

        if (component == Enums.Components.INTERIOR || component == Enums.Components.MONEY)
            me._resizeComponent(110, 100, -150, 500 - 20, 0.72);

        if (component == Enums.Components.STRATEGEM)
            me._resizeComponent(310, 100, -150, 600 -20, 0.72);
    }

    _resizeComponent(x, scrollX, scrollY, width, zoom) {
        const me = this;

        if (!!me._resizeTween)
            me._resizeTween.stop();

        const percentage = Math.abs(width, me._camera.width) / width;

        me._resizeTween = Here._.add.tween({
            targets: me._camera,
            x: x,
            width: width,
            zoom: zoom,
            scrollX: scrollX,
            scrollY: scrollY,
            duration: 1000 * percentage,
            ease: 'Sine.easeOut'
        });
    }

    _processBusStop() {
        const me = this;

        if (!(me._busStop && me._isStopped()))
            return;

        const insideBusStopArea = me._bus.x >= 515 && Math.abs(me._bus.y - me._busStop.y) <= 300
        if (!insideBusStopArea)
            return;

        if (me._state.status == Enums.BusStatus.PREPARE_TO_EXIT)
            me._changeStatus(Enums.BusStatus.EXIT);

        if (me._state.status != Enums.BusStatus.ENTER)
            return;

        if (!me._components.interior.isDoorFree())
            return;

        const doorPos = Utils.buildPoint(me._bus.x + 40, me._bus.y);
        const shift = me._consts.passengerSpeed * me._state.delta;
        for (let i = 0; i < me._passengers.length; ++i) {
            if (!me._components.interior.isDoorFree())
                break;

            const passenger = me._passengers[i];
            
            const shiftX = Math.sign(doorPos.x - passenger.x) * shift;
            const shiftY = Math.sign(doorPos.y - passenger.y) * shift;

            passenger.setPosition(passenger.x + shiftX, passenger.y + shiftY);

            if (Phaser.Math.Distance.BetweenPoints(doorPos, Utils.toPoint(passenger)) < 5) {
                me._spritePool.killAndHide(passenger);
                me._events.emit('passengerIn');
            }
        }

        me._passengers = me._passengers.filter(x => x.active);
    }

    _shiftTiles() {
        const me = this;

        if (me._isStopped())
            return;

        for (let i = 0; i < me._roadTiles.length; ++i)
            me._shiftTile(
                me._roadTiles[i], 
                tile => tile.setY(tile.y - me._roadTiles.length * 200))
        
        if (!!me._busStop) {
            me._shiftTile(me._busStop.lattern);

            me._shiftTile(me._busStop, _ => {
                me._spritePool.killAndHide(me._busStop);
                me._spritePool.killAndHide(me._busStop.lattern);
                me._busStop = null;
                me._state.position = 0;

                me._changeStatus(Enums.BusStatus.DEPARTURE);
            });

            for (let i = 0; i < me._passengers.length; ++i)
                me._shiftTile(me._passengers[i], tile => {
                    me._spritePool.killAndHide(tile);
                    me._passengers = me._passengers.filter(x => x.active);
            });
        }
    }

    _changeStatus(status) {
        const me = this;
        Utils.debugLog(`Status: ${me._state.status} => ${status}`);
        me._state.status = status;
        me._events.emit('busStatusChanged', status);
    }

    /**
     * 
     * @param {Phaser.GameObjects.Image} tile 
     * @param {Function} onBound 
     */
    _shiftTile(tile, onBound) {
        const me = this;

        tile.setY(tile.y + me._state.speed * me._state.delta);

        if (!!onBound && (tile.y - tile.width / 2) >= me._consts.lowerBound)
            onBound.call(me, tile);
    }

    _processControls() {
        const me = this;

        /** @type {Phaser.Physics.Arcade.Body} */
        const body = me._bus.body;

        if (me._components.stratagem.state.isActive) {
            body.setVelocityX(0);
            return;
        }

        if (Here.Controls.isPressing(Enums.Keyboard.UP)) {
            me._state.speed = Math.min(
                me._consts.maxSpeedY, 
                me._state.speed + me._consts.speedYUpChange * me._state.delta);
            me._smokeSprite.setScale(1.5);
        }
        else if (Here.Controls.isPressing(Enums.Keyboard.DOWN)) {
            me._state.speed = Math.max(
                0,
                 me._state.speed - me._consts.speedYDownChange * me._state.delta)
            me._smokeSprite.setScale(0.5);
        } else {
            me._smokeSprite.setScale(1);
        }

        const stopped = me._isStopped();
        me._smokeSprite.setVisible(!stopped);

        const minShiftX = stopped ? 0 : 50;
        const speedXChange = Math.min(
            500, 
            Math.max(
                minShiftX, 
                me._consts.speedXChange * me._state.speed * me._state.delta));

        if (Here.Controls.isPressing(Enums.Keyboard.LEFT)) {
            me._bus.setAngle(-10);
            body.setVelocityX(-speedXChange);
        }
        else if (Here.Controls.isPressing(Enums.Keyboard.RIGHT)) {
            me._bus.setAngle(10);
            body.setVelocityX(speedXChange);
        }
        else {
            me._bus.setAngle(0);
            body.setVelocityX(0);
        }
            
    }
}