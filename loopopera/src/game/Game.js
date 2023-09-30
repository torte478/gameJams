import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Level from './Level.js';
import Player from './Player.js';
import Triggers from './Triggers.js';
import TeleportCamera from './TeleportCamera.js';

export default class Game {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Player} */
    _player;

    /** @type {TeleportCamera} */
    _teleportCamera;

    constructor() {
        const me = this;

        // debug

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(10, 10, '', { fontSize: 18, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });

        // init

        const level = new Level();
        me._player = new Player(300, 600);

        Here._.cameras.main.startFollow(
            me._player.getCollider(),
            true,
            1,
            0,
            Config.Camera.OffsetX,
            Config.Camera.OffsetY);

        me._teleportCamera = new TeleportCamera(me._player, Consts.Border, me._log);

        const lightPool = Here._.physics.add.staticGroup();
        // lightPool.create(700, 700, 'items', 0);
        // lightPool.create(600, 700, 'items', 0);

        const triggers = new Triggers(me._player);
        // triggers.create(900, 700, 200, 200, false, () => {
        //     if (me._player.tryGiveAwayLight())
        //         Utils.debugLog('light');
        // }, me);
        triggers.create(1350, 400, 100, 800, false, () => {
                me._player.teleport(300 - 25);
                me._teleportCamera.reset();
                console.log('teleport');
            }, me);

        // physics

        Here._.physics.add.collider(
            me._player.getCollider(), 
            level.getCollider());

        Here._.physics.add.overlap(
            me._player.getCollider(),
            lightPool,
            (p, l) => {
                if (me._player.tryTakeLight())
                    lightPool.killAndHide(l);
            });
    }

    update() {
        const me = this;

        if (Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) 
            && Utils.isDebug(Config.Debug.Global))
            Here._.scene.restart({ isRestart: true });

        me._player.update();
        me._teleportCamera.update();

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            const mouse = Here._.input.activePointer;

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` + 
                `plr: ${me._player._container.x | 0} ${me._player._container.y | 0}\n` +
                `vie: ${Here._.cameras.main.scrollX}`;

            me._log.setText(text);
        });
    }
}