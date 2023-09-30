import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Player from "./Player.js";

export default class TeleportCamera {

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    _camera;

    /** @type {Player} */
    _player;

    /** @type {Number} */
    _border;

    constructor(player, border, log) {
        const me = this;

        me._player = player;
        me._border = border;

        const scroll = me._player.toPos().x + Consts.Unit.Small;
        me._camera = Here._.cameras.add(
            Consts.Viewport.Width + 100,
            0, 
            Consts.Viewport.Width,
            Consts.Viewport.Height,
            false)
            .setScroll(scroll, 0)
            .setBackgroundColor('#A0908D') //debug
            .setBackgroundColor('#1a1a1a')
            ;

        if (!!log)
            me._camera.ignore(log);
    }

    update() {
        const me = this;

        const diff = me._border - Here._.cameras.main.scrollX;
        if (diff > Consts.Viewport.Width && (me._player.toPos() - me._border) > Consts.Viewport.Width)
            return;

        me._camera.setPosition(
            diff,
            0)
    }

    reset() {
        const me = this;

        me._camera.setPosition(Consts.Viewport.Width + 100, 0);
    }
}