import Here from "../framework/Here.js";
import Player from "./Player.js";

export default class Triggers {
    
    /** @type {Player} */
    _player;

    /** @type {Object} */
    _context;

    /** @type {Phaser.GameObjects.Zone[]} */
    _zones = []

    /** @type {Player} */
    constructor(player) {
        const me = this;

        me._player = player;
    }

    /**
     * @param {Function} callback 
     * @param {Object} context 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Boolean} disposable 
     */
    create(callback, context, x, y, width, height, disposable) {
        const me = this;

        const zone = Here._.add.zone(x, y, width, height);
        me._zones.push(zone);
        Here._.physics.add.existing(zone, true);

        Here._.physics.add.overlap(
            me._player.toCollider(),
            zone,
            (p, z) => {
                if (!!callback)
                    callback.call(context);

                if (disposable)
                    zone.destroy();
            });

        return me._zones.length - 1;
    }

    remove(index) {
        const me = this;

        const zone = me._zones[index];
        if (!!zone)
            zone.destroy();
    }
}