import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Level from './Level.js';
import Player from './Player.js';

export default class Game {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Player} */
    _player;

    constructor() {
        const me = this;

        // init

        const level = new Level();
        me._player = new Player(120, 600);

        Here._.cameras.main.startFollow(
            me._player.getCollider(),
            true,
            1,
            0,
            -200,
            200);

        const lightPool = Here._.physics.add.staticGroup();
        lightPool.create(700, 700, 'items', 0);
        lightPool.create(600, 700, 'items', 0);

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

        // debug

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(10, 10, '', { fontSize: 18, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        });
    }

    update() {
        const me = this;

        if (Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) 
            && Utils.isDebug(Config.Debug.Global))
            Here._.scene.restart({ isRestart: true });

        me._player.update();

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            const mouse = Here._.input.activePointer;

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n`;

            me._log.setText(text);
        });
    }
}