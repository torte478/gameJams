import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';
import Player from './Player.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Controls} */
    _controls;

    /** @type {Player} */
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

        me._player = new Player(scene);
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

        me._scene.physics.add.collider(me._player.getCollider(), tiles);
        me._scene.physics.add.overlap(me._player.getCollider(), exit, () => {
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

        me._player.setDirectionX(signX);

        if (me._controls.isDownOnce(Enums.Keyboard.UP))
            me._player.tryJump();

        // portals

        let shift = 0;
        if (me._controls.isDownOnce(Enums.Keyboard.X))
            shift = -1;
        else if (me._controls.isDownOnce(Enums.Keyboard.C))
            shift = 1;

        const nextLayer = me._layer + shift;

        const teleported = 
            nextLayer != me._layer 
            && nextLayer >= 0 
            && nextLayer < Consts.Layers
            && me._player.tryTeleport(nextLayer, me._scene.physics, me._level);

        if (teleported) {
            me._scene.cameras.main.setScroll(0, nextLayer * Consts.Viewport.Height);
            me._layer = nextLayer;
        }
    }
}