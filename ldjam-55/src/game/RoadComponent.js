import Here from '../framework/Here.js';
import Phaser from '../lib/phaser.js';
import Enums from './Enums.js';

export default class RoadComponent {

    _consts = {
        lowerBound: 1000,

        speedXChange: 50,

        maxSpeedY: 1000,
        speedYUpChange: 200,
        speedYDownChange: 400,

        busStopInterval: 1000,

        depth: {
            road: 0,
            busStop: 100,
            bus: 500
        }
    }
    _state = {
        speed: 200,
        position: 1000
    }

    /** @type {Phaser.GameObjects.Image} */
    _busStop;

    constructor() {
        const me = this;

        me._roadTilesGroup = Here._.add.group();
        me._roadTiles = [];
        for (let i = -2; i < 4; ++i){
            const tile = me._roadTilesGroup.create(350, 100 + i * 200, 'road')
            tile.setDepth(me._consts.depth.road);
            me._roadTiles.push(tile);
        }

        const busSprite = Here._.add.image(0, 0, 'bus');

        me._bus = Here._.add.container(400, 700, [ busSprite ])
            .setDepth(me._consts.depth.bus);
        Here._.physics.world.enable(me._bus);
    }

    update(delta) {
        const me = this;

        me._processControls(delta);

        me._state.position += me._state.speed * delta;

        if (!me._busStop && me._state.position >= me._consts.busStopInterval) {
            me._busStop = Here._.add.image(600, -300, 'busStop').setDepth(me._consts.depth.busStop);
        }

        for (let i = 0; i < me._roadTiles.length; ++i) {
            /** @type {Phaser.GameObjects.Image} */
            const tile = me._roadTiles[i];

            tile.setY(tile.y + me._state.speed * delta);
            if (tile.y >= me._consts.lowerBound)
                tile.setY(tile.y - me._roadTiles.length * 200);
        }
        
        if (!!me._busStop) {
            me._busStop.setY(me._busStop.y + me._state.speed * delta);
        }
    }

    _processControls(delta) {
        const me = this;

        if (Here.Controls.isPressing(Enums.Keyboard.UP)) {
            me._state.speed = Math.min(me._consts.maxSpeedY, me._state.speed + me._consts.speedYUpChange * delta)
        }
        else if (Here.Controls.isPressing(Enums.Keyboard.DOWN)) {
            me._state.speed = Math.max(0, me._state.speed - me._consts.speedYDownChange * delta)
        }

        /** @type {Phaser.Physics.Arcade.Body} */
        const body = me._bus.body;
        const speedXChange = Math.min(500, Math.max(50, me._consts.speedXChange * me._state.speed * delta));
        if (Here.Controls.isPressing(Enums.Keyboard.LEFT))
            body.setVelocityX(-speedXChange);
        else if (Here.Controls.isPressing(Enums.Keyboard.RIGHT))
            body.setVelocityX(speedXChange);
        else
            body.setVelocityX(0);
    }
}