import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';
import Helper from './Helper.js';
import Player from './Player.js';
import She from './She.js';
import Utils from './Utils.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Controls} */
    _controls;

    /** @type {Phaser.GameObjects.Text} */
    _debugText;

    /** @type {Player} */
    _player;

    /** @type {She} */
    _she;

    /** @type {Phaser.Tilemaps.Tilemap} */
    _level;

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

        me._level = scene.make.tilemap({
            key: 'level0',
            tileWidth: Consts.Unit.Small,
            tileHeight: Consts.Unit.Small
        });

        const tileset = me._level.addTilesetImage('tiles');

        const tiles = me._level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Background);

        me._controls = new Controls(scene.input);

        me._she = new She(scene, 100, 438);

        me._player = new Player(scene, 200, 690);

        // physics

        me._level.setCollision(8);
        scene.physics.world.enable(me._player.toGameObject());

        scene.physics.add.collider(
            me._player.toGameObject(),
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

        const status = me._player.update();
        me._controls.update();

        if (status == Enums.PlayerStatus.FALL) {
            
            if (me._she.state != Enums.SheState.CATCH) {
                const target = me._getCatchPlayerTarget(
                    me._player.lastGround.pos, 
                    me._player.lastGround.flip);
    
                me._she.catchPlayer(
                    me._player,
                    target,
                    () => { me._player.disablePhysics() },
                    () => { me._player.awake(); }
                );
            }
        } else {
            me._movePlayer();
        }

        // debug

        if (Config.Debug.Global && Config.Debug.Text) {
            const text =
                `mse: ${me._scene.input.activePointer.worldX} ${me._scene.input.activePointer.worldY}\n` + 
                `plr: ${me._player._container.x | 0} ${me._player._container.y | 0}\n`+
                `lst: ${me._player.lastGround.pos.x | 0} ${me._player.lastGround.pos.y | 0}`;
            me._debugText.setText(text);
        }
    }

    _getCatchPlayerTarget(pos, flip) {
        const me = this;

        const rectangle = new Phaser.Geom.Rectangle(
            pos.x, 
            pos.y, 
            Consts.Unit.PlayerWidth, 
            Consts.Unit.PlayerHeight);

        return Utils.buildPoint(pos.x, pos.y);
    }

    _isTileFree(rect) {
        const me = this;

        const x = Math.floor(rect.x / Consts.Unit.Small);
        const y = Math.floor(rect.y / Consts.Unit.Small);

        const widthMod = rect.x % Consts.Unit.Small > 4 ? 1 : 0;
        const heghtMod = rect.y % Consts.Unit.Small > 4 ? 1 : 0;

        const width = Math.floor(rect.width / Consts.Unit.Small) + widthMod;
        const height = Math.floor(rect.height / Consts.Unit.Small) + heghtMod;

        const tiles = me._level.findTile(() => true, this, x, y, width, height, { 
            isColliding: true });

        return !tiles;
    }

    _movePlayer() {
        const me = this;

        if (me._player.isBusy)
            return;

        if (me._controls.isDownOnce(Enums.Keyboard.JUMP))
            me._player.tryJump();

        let signX = 0;
        if (me._controls.isDown(Enums.Keyboard.LEFT))
            signX = -1;
        else if (me._controls.isDown(Enums.Keyboard.RIGHT))
            signX = 1;

        me._player.setVelocityX(signX);
    }
}