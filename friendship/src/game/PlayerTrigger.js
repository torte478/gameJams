import Phaser from '../lib/phaser.js';
import Callback from './Callback.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';
import Player from './Player.js';
import Utils from './utils/Utils.js';

export default class PlayerTrigger {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.Geom.Rectangle} */
    _zone;

    /** @type {Controls} */
    _controls;

    /** @type {Callback} */
    _onEnter;

    /** @type {Callback} */
    _onAction;

    /** @type {Callback} */
    _onExit;

    /** @type {Boolean} */
    _isPlayerInside;

    /** @type {Phaser.GameObjects.Image} */
    _hint;

    _ignoreHint;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Geom.Rectangle} zone
     * @param {Controls} controls 
     * @param {Callback} onEnter 
     * @param {Callback} onAction 
     * @param {Callback} onExit 
     */
    constructor(scene, zone, controls, onEnter, onAction, onExit, ignoreHint) {
        const me = this;

        me._scene = scene;
        me._zone = zone;
        me._controls = controls;
        me._onEnter = onEnter;
        me._onAction = onAction;
        me._onExit = onExit;
        me._isPlayerInside = false;
        me._ignoreHint = !!ignoreHint;

        me._hint = scene.add.image(zone.centerX, zone.centerY, 'big', 9)
            .setDepth(Consts.Depth.GUI)
            .setVisible(false);
        
        Utils.ifDebug(Config.Debug.ShowTrigger, () => {
            scene.add.rectangle(
                zone.x + (zone.width / 2), 
                zone.y + (zone.height / 2), 
                zone.width, 
                zone.height)
                .setDepth(Consts.Depth.Max)
                .setStrokeStyle(2, 0xff0000);
        });
    }

    update() {
        const me = this;

        const colliders = me._scene.physics.overlapRect(me._zone.x, me._zone.y, me._zone.width, me._zone.height, true);
        const player = Utils.firstOrNull(colliders, c => !!c.gameObject.isPlayer);
        const isPlayer = player != null;
        
        if (!me._ignoreHint) {
            me._hint.setVisible(isPlayer);
        
            if (isPlayer)
                me._hint.setPosition(player.gameObject.x, player.gameObject.y + 75);
        }

        if (isPlayer && !me._isPlayerInside) {
            me._isPlayerInside = true;
            me._onEnter.call();
        } else if (!isPlayer && me._isPlayerInside) {
            me._isPlayerInside = false;
            me._onExit.call();
        }

        if (me._isPlayerInside && me._controls.isDownOnce(Enums.Keyboard.FIRE)) {
            Config.WasTriggerAction = true;
            me._onAction.call();
        }
    }
}

