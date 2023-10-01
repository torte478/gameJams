import Here from "../framework/Here.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Hand from "./Hand.js";

export default class Boss {

    _container;
    _handPool;

    /** @type { Hand[]} */
    _hands = [];

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

        for (let i = 0; i < Boss._handPositions[index].length; ++i) {
            const pos = Boss._handPositions[index][i];
            const hand = new Hand(pos.x, pos.y, pos.dir, me._handPool);
            me._hands.push(hand);
        }
    }

    static _handPositions = [
        // 0
        [
            { x: 600, y: 2525, dir: Enums.HandDirection.UP }
        ]
    ]
}