import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Controls} */
    _controls;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _player;

    /** @type {Number} */
    _layer;

    /** @type {Phaser.Tilemaps.Tilemap} */
    _level;

    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;

        me._controls = new Controls(scene.input.keyboard);

        me._player = me._scene.physics.add.sprite(Config.Player.X, Config.Player.Y, 'sprites', 0);
        me._layer = Enums.Layer.PRESENT;

        me._level = me._scene.make.tilemap({
            key: 'level',
            tileWidth: Consts.Unit.Small,
            tileHeight: Consts.Unit.Small
        });

        const tileset = me._level.addTilesetImage('tiles');
        const tiles = me._level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Tiles);

        me._level.setCollisionBetween(1, 3);

        const exit = me._scene.physics.add.image(925, 1525, 'sprites', 11);
        exit.body.setAllowGravity(false);

        me._scene.physics.add.collider(me._player, tiles);
        me._scene.physics.add.overlap(me._player, exit, () => {
            console.log('YOU WIN!!!');
        })

        me._scene.cameras.main.setScroll(0, me._layer * Consts.Viewport.Height);
    }

    update() {
        const me = this;

        me._controls.update();

        // movement
        let signX = 0;
        if (me._controls.isDown(Enums.Keyboard.LEFT))
            signX = -1;
        else if (me._controls.isDown(Enums.Keyboard.RIGHT))
            signX = 1;

        if (signX != 0)
            me._player.setFlipX(signX < 0);

        me._player.setVelocityX(signX * Config.Physics.VelocityX);

        const isJump = me._controls.isDownOnce(Enums.Keyboard.UP) 
                      && me._player.body.blocked.down;
        if (isJump)
            me._player.setVelocityY(Config.Physics.Jump);

        // portals

        let shift = 0;
        if (me._controls.isDownOnce(Enums.Keyboard.X))
            shift = -1;
        else if (me._controls.isDownOnce(Enums.Keyboard.C))
            shift = 1;

        const nextLayer = me._layer + shift;
        const target = me._findFreePosition(nextLayer);
        if (!!target) {
            me._player.setPosition(target.x, target.y);
            me._scene.cameras.main.setScroll(0, nextLayer * Consts.Viewport.Height);
            me._layer = nextLayer;
        }
    }

    _findFreePosition(nextLayer) {
        const me = this;

        if (nextLayer == me._layer || nextLayer < 0 || nextLayer >= Consts.Layers)
            return null;

        if (!me._player.body.blocked.down)
            return null;

        const bounds = me._player.getBounds();

        const relativeY = bounds.top % Consts.Viewport.Height;
        const nextY = nextLayer * Consts.Viewport.Height + relativeY;

        const target = new Phaser.Geom.Rectangle(
            Math.round(bounds.left / Consts.Unit.Small) * Consts.Unit.Small,
            Math.round(nextY / Consts.Unit.Small) * Consts.Unit.Small,
            bounds.width,
            bounds.height);

        if (!me._isCollisionFree(target))
            return null;

        return new Phaser.Geom.Point(
            target.x + target.width / 2,
            target.y + target.height / 2
        );
    }

    /**
     * @param {Phaser.Geom.Rectangle} rect 
     * @returns {Boolean}
     */
    _isCollisionFree(rect) {
        const me = this;

        const bodies = me._scene.physics.overlapRect(rect);

        if (bodies.length > 0)
            return false;
        
        const tileX = Math.floor(rect.x / Consts.Unit.Small);
        const tileY = Math.floor(rect.y / Consts.Unit.Small);
        const tiles = me._level.findTile(
            () => true, 
            me, 
            tileX, 
            tileY, 
            2, // TODO : fall on sprite size change
            2, 
            { isColliding: true });

        if (!!tiles)
            return false;

        return true;
    }
}