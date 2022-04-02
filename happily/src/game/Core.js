import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';
import Helper from './Helper.js';
import Player from './Player.js';
import Utils from './Utils.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Player} */
    _player;

    /** @type {Controls} */
    _controls;

    /** @type {Phaser.GameObjects.Text} */
    _debugText;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;

        // phaser

        // custom

        scene.add.image(
            Consts.Viewport.Width / 2,
            Consts.Viewport.Height / 2,
            'background')
            .setDepth(Consts.Depth.Background)
            .setScrollFactor(0);

        const level = scene.make.tilemap({
            key: 'level0',
            tileWidth: Consts.Unit.Small,
            tileHeight: Consts.Unit.Small
        });

        const tileset = level.addTilesetImage('tiles');

        const tiles = level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Background);

        me._player = new Player(scene, 360, 100);
        me._controls = new Controls(scene.input);

        // physics

        level.setCollision(8);
        scene.physics.world.enable(me._player.toCollider());

        scene.physics.add.collider(
            me._player.toCollider(),
            tiles);

        // debug

        if (Config.Debug.Global && Config.Debug.Text) {
            me._debugText = scene.add.text(10, 10, 'DEBUG', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        }
    }

    update() {
        const me = this;

        me._player.update();
        me._controls.update();

        // movement
        if (me._controls.isDownOnce(Enums.Keyboard.JUMP))
            me._player.tryJump();

        let signX = 0;
        if (me._controls.isDown(Enums.Keyboard.LEFT))
            signX = -1;
        else if (me._controls.isDown(Enums.Keyboard.RIGHT))
            signX = 1;

        me._player.setVelocityX(signX);

        // debug

        if (Config.Debug.Global && Config.Debug.Text) {
            const text =
                `mse: ${me._scene.input.activePointer.worldX} ${me._scene.input.activePointer.worldY}`;
            me._debugText.setText(text);
        }
    }
}