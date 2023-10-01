import Here from "../framework/Here.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Hand from "./Hand.js";

export default class Boss {

    _container;

    /** @type {Phaser.Physics.Arcade.Group} */
    _handPool;

    /** @type { Hand[]} */
    _hands = [];

    /** @type {Phaser.Time.TimerEvent[]} */
    _events = [];

    constructor(x, y, handPool) {
        const me = this;

        me._handPool = handPool;

        const sprite = Here._.add.image(0, 0, 'boss');
        me._container = Here._.add.container(x, y, [ sprite ])
            .setSize(500, 600)
            .setDepth(Consts.Depth.Boss);

        Here._.physics.world.enable(me._container);
    }

    toCollider() {
        const me = this;

        return me._container;
    }

    startHands(index) {
        const me = this;

        const event = Here._.time.addEvent({
            delay: Config.BossHandsDelayMs,
            callback: () => me._createHand(index, event),
            callbackScope: me,
            repeat: Boss._handPositions[index].length});
        me._events.push(event);
    }

    resetHands() {
        const me = this;

        for (let i = 0; i < me._events.length; ++i) {
            const event = me._events[i];
            event.paused = true;
            event.destroy();
        }
        me._events = [];

        for (let i = 0; i < me._hands.length; ++i) {
            const hand = me._hands[i];
            hand.kill();
            me._handPool.killAndHide(hand._sprite);
        }
        me._hands = [];
    }

    _createHand(index, event) {
        const me = this;

        const arr = Boss._handPositions[index];
        if (event.repeatCount === 0)
            return;

        const pos = arr[arr.length - event.repeatCount];
        const hand = new Hand(pos.x, pos.y, pos.dir, me._handPool);
        me._hands.push(hand);
    }

    static _handPositions = [
        // 0
        [
            { x: 600, y: 2425, dir: Enums.HandDirection.UP },
            { x: 800, y: 2425, dir: Enums.HandDirection.DOWN },
            { x: 1100, y: 2425, dir: Enums.HandDirection.UP },
            { x: 1400, y: 2425, dir: Enums.HandDirection.DOWN },
            { x: 1600, y: 2425, dir: Enums.HandDirection.UP },
            { x: 1875, y: 2550, dir: Enums.HandDirection.RIGHT },
            { x: 1875, y: 2650, dir: Enums.HandDirection.LEFT },
        ],
        //1
        [
            { x: 2625, y: 2650, dir: Enums.HandDirection.LEFT },
            { x: 2650, y: 2800, dir: Enums.HandDirection.UP },
            { x: 2850, y: 2800, dir: Enums.HandDirection.DOWN },
            { x: 3005, y: 2800, dir: Enums.HandDirection.UP },
            { x: 3400, y: 2650, dir: Enums.HandDirection.LEFT },
            { x: 3105, y: 2600, dir: Enums.HandDirection.UP },
            { x: 3350, y: 2375, dir: Enums.HandDirection.DOWN },
            { x: 3550, y: 2375, dir: Enums.HandDirection.DOWN },
            { x: 3725, y: 2650, dir: Enums.HandDirection.LEFT },
            { x: 3625, y: 2950, dir: Enums.HandDirection.RIGHT },
            { x: 3895, y: 2925, dir: Enums.HandDirection.DOWN },
            { x: 3995, y: 3025, dir: Enums.HandDirection.UP },
            { x: 4095, y: 2925, dir: Enums.HandDirection.DOWN },
            { x: 4475, y: 3025, dir: Enums.HandDirection.UP },
            { x: 4700, y: 2925, dir: Enums.HandDirection.DOWN },
            { x: 4900, y: 3025, dir: Enums.HandDirection.UP },
        ],
        // 2
        [
            
        ]
    ]
}