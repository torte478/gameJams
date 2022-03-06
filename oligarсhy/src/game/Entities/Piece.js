import Phaser from "../../lib/phaser.js";

import Consts from "../Consts.js";
import Enums from "../Enums.js";

export default class Piece {
    
    _sprite;

    _selection;

    _tween;

    _container;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} frame 
     */
    constructor(scene, x, y, player) {
        const me = this;

        me._selection = scene.add.image(0, 0, 'pieces', 8)
           .setVisible(false);

        me._sprite = scene.add.image(0, 0, 'pieces', player * 2);

        me._container = scene.add.container(x, y, [ me._selection, me._sprite ])
            .setDepth(Consts.Depth.Pieces);

        if (player == Enums.PlayerIndex.HUMAN)
            me._tween = scene.tweens.add({
                targets: me._selection,
                scale: { from: 1, to: 1.25 },
                duration: Consts.Speed.Selection,
                yoyo: true,
                repeat: -1
            });
    }

    toGameObject() {
        const me = this;

        return me._container;
    }

    select() {
        const me = this;

        me._selection.setVisible(true);
        me._tween.resume();
    }

    unselect() {
        const me = this;

        me._selection.setVisible(false);
        me._tween.pause();
    }
}