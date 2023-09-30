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
import Border from './Border.js';

export default class Game {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Player} */
    _player;

    /** @type {TeleportCamera} */
    _teleportCamera;

    /** @type {Border} */
    _backBorder;

    constructor() {
        const me = this;

        // debug

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(10, 10, '', { fontSize: 18, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });

        // create

        const level = new Level();
        me._player = new Player(Config.Player.StartX, Config.Player.StartY);

        Here._.cameras.main.startFollow(
            me._player.toCollider(),
            true,
            1,
            0,
            Config.Camera.OffsetX,
            Config.Camera.OffsetY);

        me._teleportCamera = new TeleportCamera(me._player, Config.Camera.Border, me._log);
        me._backBorder = new Border(me._player, -200);

        const lightPool = Here._.physics.add.staticGroup();
        const triggers = new Triggers(me._player);

        // init

        // lightPool.create(700, 700, 'items', 0);
        lightPool.create(1000, 700, 'items', 0);

        triggers.create(600, 700, 200, 200, false, () => {
            if (me._player.tryGiveAwayLight())
                Utils.debugLog('light');
        }, me);

        triggers.create(Config.Camera.Border + Consts.Unit.Normal, 400, Consts.Unit.Big, 800, false, () => {
                me._player.teleport(Config.Player.StartX);
                me._teleportCamera.reset();
                Here._.cameras.main.setScroll(100, 0); // TODO
                me._backBorder.reset();
                console.log('teleport');
            }, me);

        // physics

        Here._.physics.add.collider(
            me._player.toCollider(), 
            level.getCollider());

        Here._.physics.add.overlap(
            me._player.toCollider(),
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

        me._updateInternal();

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            const mouse = Here._.input.activePointer;

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` + 
                `plr: ${me._player._container.x | 0} ${me._player._container.y | 0}\n` +
                `vie: ${Here._.cameras.main.scrollX | 0} ${me._teleportCamera._camera.scrollX | 0}`;

            me._log.setText(text);
        });
    }

    _updateInternal() {
        const me = this;

        me._player.update();
        Here._.cameras.main.setBounds(
            Here._.cameras.main.scrollX,
            0,
            2 * Consts.Viewport.Width,
            Consts.Viewport.Height);

        me._teleportCamera.update();
        me._backBorder.update();
    }
}