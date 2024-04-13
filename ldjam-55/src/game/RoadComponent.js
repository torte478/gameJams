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
        busStopCreate: 2000,

        passengerSpeed: 50 * 4,

        depth: {
            road: 0,
            busStop: 100,
            passengers: 200,
            bus: 500,
        }
    }
    _state = {
        speed: 0,
        position: 0,
        delta: 0,
        status: Enums.BusStatus.ENTER
    }

    /** @type {Components} */
    _components;

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    _camera;

    /** @type {Phaser.GameObjects.Group} */
    _spritePool;

    /** @type {Phaser.GameObjects.Image} */
    _busStop;

    /** @type {Phaser.GameObjects.Image[]} */
    _passengers = [];

    /** @type {Phaser.Events.EventEmitter} */
    _events;

    /** @type {Phaser.Tweens.Tween} */
    _resizeTween;

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

        const busSprite = Here._.add.image(0, 0, 'bus');

        me._bus = Here._.add.container(550, 700, [ busSprite ])
            .setDepth(me._consts.depth.bus);
        Here._.physics.world.enable(me._bus);

        me._events.on('componentActivated', me._onComponentActivated, me);

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
            me._createBusStop(-300);

        me._processBusStop();
        me._shiftTiles();
    }

    _createBusStop(busStopY) {
        const me = this;

        me._busStop = me._spritePool.create(600, busStopY, 'busStop').setDepth(me._consts.depth.busStop);

        let positions = Utils
            .buildArray(
                Utils.getRandom(3, 3, 24), 0)
            .map((_, i) => Utils.buildPoint(
                me._busStop.x + Math.floor(i / 12) * 50 + 10 + Utils.getRandom(0, 15),
                me._busStop.y  - (me._busStop.height / 2) + 25 + (i % 12 * 50) + Utils.getRandom(0, 10)));

        positions = Utils.shuffle(positions);

        const passengerCount = 10;
        for (let i = 0; i < passengerCount; ++i) {
            const passenger = me._spritePool.create(
                positions[i].x,
                positions[i].y,
                'passengerOutside')
                .setDepth(me._consts.depth.passengers);

            me._passengers.push(passenger);
        };
    }

    _onComponentActivated(component, isActive, percentage) {
        const me = this;

        if (component == Enums.Components.INTERIOR) {
            if (!!me._resizeTween)
                me._resizeTween.stop();

            const targetWidth = (isActive ? 500 : 700) - 20;
            const targetZoom = isActive ? 0.72 : 1;
            const targetScrollX = isActive ? 100 : 0;
            const targetScrollY = isActive ? -150 : 0;

            me._resizeTween = Here._.add.tween({
                targets: me._camera,
                width: targetWidth,
                zoom: targetZoom,
                scrollX: targetScrollX,
                scrollY: targetScrollY,
                duration: 1000 * percentage,
                ease: 'Sine.easeOut'
            });
        }
    }

    _processBusStop() {
        const me = this;

        if (!(me._busStop && me._isStopped()))
            return;

        const insideBusStopArea = me._bus.x >= 515 && Math.abs(me._bus.y - me._busStop.y) <= 300
        if (!insideBusStopArea)
            return;

        if (me._state.status != Enums.BusStatus.ENTER)
            return;

        if (!me._components.interior.isDoorFree())
            return;

        const doorPos = Utils.buildPoint(me._bus.x + 25, me._bus.y);
        const shift = me._consts.passengerSpeed * me._state.delta;
        for (let i = 0; i < me._passengers.length; ++i) {
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

    _isStopped() {
        const me = this;

        return Math.abs(me._state.speed) <= 0.01;
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
            me._shiftTile(me._busStop, _ => {
                me._spritePool.killAndHide(me._busStop);
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

        if (Here.Controls.isPressing(Enums.Keyboard.UP)) {
            me._state.speed = Math.min(
                me._consts.maxSpeedY, 
                me._state.speed + me._consts.speedYUpChange * me._state.delta)
        }
        else if (Here.Controls.isPressing(Enums.Keyboard.DOWN)) {
            me._state.speed = Math.max(
                0,
                 me._state.speed - me._consts.speedYDownChange * me._state.delta)
        }

        /** @type {Phaser.Physics.Arcade.Body} */
        const body = me._bus.body;
        const minShiftX = me._isStopped() ? 0 : 50;
        const speedXChange = Math.min(
            500, 
            Math.max(
                minShiftX, 
                me._consts.speedXChange * me._state.speed * me._state.delta));

        if (Here.Controls.isPressing(Enums.Keyboard.LEFT))
            body.setVelocityX(-speedXChange);
        else if (Here.Controls.isPressing(Enums.Keyboard.RIGHT))
            body.setVelocityX(speedXChange);
        else
            body.setVelocityX(0);
    }
}