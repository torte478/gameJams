import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Player from './Player.js';
import Audio from './utils/Audio.js';

export default class Hub {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.Tilemaps.TilemapLayer} */
    _tiles;

    /** @type {Phaser.Geom.Point} */
    _pos;

    /** @type {Phaser.Geom.Rectangle} */
    _originBounds;

    /** @type {Phaser.GameObjects.Sprite} */
    _charger;

    /** @type {Audio} */
    _audio;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Geom.Rectangle} originBounds
     */
    constructor(scene, originBounds, audio) {
        const me = this;

        me._audio = audio;

        me._scene = scene;
        me._originBounds = originBounds;

        const t = 15;

        const tilemap  = scene.make.tilemap({
            tileWidth: Consts.Unit,
            tileHeight: Consts.Unit,
            data: [
                [t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t],
                [t, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, t],
                [t, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, t],
                [t, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, t],
                [t, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, t],
                [t, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, t],
                [t, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, t],
                [t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t],
            ]
        });
        me._pos = Config.Hub.Pos;
        const tileset = tilemap.addTilesetImage('tilemap');
        me._tiles = tilemap.createLayer(0, tileset, me._pos.x, me._pos.y)
            .setDepth(Consts.Depth.Tiles);

        for (let i = 0; i < Consts.CollideTiles.length; ++i) {
            const tileIndex = Consts.CollideTiles[i];
            tilemap.setCollision(tileIndex);
        }

        scene.add.image(me._pos.x + 400, me._pos.y + 200, 'hub')
            .setDepth(Consts.Depth.Background);

        me._charger = scene.add.sprite(125, 3275, 'charger', 0);

        scene.add.sprite(400, 3314, 'main', 5)
            .play('fire')
    }

    getTiles() {
        const me = this;

        return me._tiles;
    }

    /**
     * @param {Player} player 
     */
    enter(player) {
        const me = this;

        me._scene.cameras.main.setBounds(me._pos.x - 100, me._pos.y - 200, 1000, 800);
        player.toGameObject().setPosition(me._pos.x + 250, me._pos.y + 290);
    }

    /**
     * @param {Player} player 
     */
    startCharge(player) {
        const me = this;

        const rate = Config.HubAnimationRate;

        player._sprite.setFlipX(true).setFrame(0).stop();
        player._gun.setFrame(0).setFlipX(true);

        me._charger.setFrame(1);
        player._gun.setVisible(false);
        player._sprite.setFrame(6);

        me._audio.play('action');

        me._scene.time.delayedCall(rate, () => {
            me._charger.setFrame(2);
            player._sprite.setVisible(false);
            player._insideSprite.setFlipX(true).setVisible(true).play('player_idle_inside');

            me._audio.play('action');

            me._scene.time.delayedCall(rate / 2, () => {
                me._charger.play('charger_charge');
                player.isBusy = false;
                player.startCharge();
                player._isInside = true;
            }, me);
        }, me);
    }

    /**
     * @param {Player} player 
     */
    exit(player) {
        const me = this;

        me._scene.cameras.main.setBounds(
            me._originBounds.x, 
            me._originBounds.y, 
            me._originBounds.width, 
            me._originBounds.height);

        player._insideSprite.setVisible(false);
        player._sprite.setVisible(true);
        player._gun.setVisible(true);
        player._isInside = false;

        player.toGameObject().setPosition(
            Config.Start.HubEnterTrigger.x + 100,
            Config.Start.HubEnterTrigger.y + 150);

        player.stopCharge();
    }
}