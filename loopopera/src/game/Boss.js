import Here from "../framework/Here.js";
import Consts from "./Consts.js";

export default class Boss {

    _container;

    constructor(x, y) {
        const me = this;

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
}