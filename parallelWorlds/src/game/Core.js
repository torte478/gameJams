import Phaser from '../lib/phaser.js';

import Entities from './Entities/Entities.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';
import Levels from './Levels.js';
import Player from './Player.js';
import Utils from './Utils.js';
import Graphics from './Graphics.js';
import Sound from './Sound.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Controls} */
    _controls;

    /** @type {Player} */
    _player;

    /** @type {Entities} */
    _entities;

    /** @type {Number} */
    _layer; // TODO : to status

    /** @type {Graphics} */
    _graphics;

    /** @type {Sound} */
    _sound;

    /** @type {Phaser.Cameras.Scene2D.Camera[]} */
    _debugCameras;

    /**
     * @param {Phaser.Scene} scene
     * @param {Number} levelIndex
     */
    constructor(scene, levelIndex) {
        const me = this;

        me._scene = scene;

        me._controls = new Controls(scene.input);

        me._player = new Player(scene);
        me._layer = Enums.Layer.PRESENT;

        me._graphics = new Graphics(scene);

        me._sound = new Sound(me._scene.sound, 1); //TODO

        me._entities = new Entities(scene, Levels.Config[levelIndex], me._sound);

        me._initColliders();

        const timeScale = me._getPlayerTimeScale(me._layer);
        me._entities.tweens.forEach((t) => {
            t.timeScale = timeScale[t.layer];
        });

        me._scene.cameras.main.setScroll(0, me._layer * Consts.Viewport.Height);

        if (Config.DebugCameras) {
            me._scene.cameras.main.setSize(Consts.Viewport.Width, Consts.Viewport.Height);

            me._debugCameras = [];

            me._debugCameras.push(
                me._scene.cameras.add(
                    Consts.Viewport.Width, 
                    0, 
                    Consts.Viewport.Width, 
                    Consts.Viewport.Height / 2)
                .setScroll(
                    Consts.Viewport.Width / 2, 
                    0 + Consts.Viewport.Height / 4)
                .setZoom(0.5));

            me._debugCameras.push(
                me._scene.cameras.add(
                    Consts.Viewport.Width, 
                    Consts.Viewport.Height / 2, 
                    Consts.Viewport.Width, 
                    Consts.Viewport.Height / 2)
                .setScroll(
                    Consts.Viewport.Width / 2, 
                    Consts.Viewport.Height * 2 + Consts.Viewport.Height / 4)
                .setZoom(0.5));   
                
            me._debugCameras[0].ignore(me._graphics._fade);
            me._debugCameras[1].ignore(me._graphics._fade);
        }
    }

    update() {
        const me = this;

        me._controls.update();

        if (me._player.isBusy)
            return;

        // movement
        if (me._controls.isDownOnce(Enums.Keyboard.JUMP)) {
            const jump = me._player.tryJump();
            if (jump)
                me._sound.play('jump');
        }

        let signX = 0;
        if (me._controls.isDown(Enums.Keyboard.LEFT))
            signX = -1;
        else if (me._controls.isDown(Enums.Keyboard.RIGHT))
            signX = 1;

        me._player.setVelocityX(signX);

        // phantom
        if (me._tryLookPhantom())
            return;

        // portals
        me._tryTeleport();
    }

    _initColliders() {
        const me = this;
        const player = me._player.getCollider();

        // Player

        me._scene.physics.add.overlap(
            player,
            me._entities.bullets,
            (p, b) => {
                b.parentTween.restart();
                console.log('hit');
            });

        me._scene.physics.add.overlap(
            player,
            me._entities.bullets,
            (p, b) => {
                b.parentTween.restart();
                console.log('hit');
            });

        me._scene.physics.add.collider(
            player,
            me._entities.doors);

        me._scene.physics.add.overlap(
            player,
            me._entities.buttons,
            me._onButtonPush,
            () => true,
            me);

        me._scene.physics.add.overlap(
            player,
            me._entities.exits,
            () => { console.log('YOU WIN!!!'); });

        me._scene.physics.add.overlap(
            player,
            me._entities.enemies,
            () => { console.log('You lose!'); });

        me._scene.physics.add.overlap(
            player,
            me._entities.portals,
            (p, portal) => { 
                const nextLayer = me._layer + (portal.entity.toFuture ? 1 : -1);
                me._tryTeleportTo(nextLayer);
        });

        me._scene.physics.add.collider(
            player, 
            me._entities.map.getCollider());

        // other

        me._scene.physics.add.overlap(
            me._entities.buttons,
            me._entities.bullets,
            me._onButtonPush,
            () => true,
            me);

        me._scene.physics.add.overlap(
            me._entities.portals,
            me._entities.enemies,
            (portal, enemy) => {
                const sign = portal.entity.toFuture ? 1 : -1;
                enemy.y += sign * Consts.Viewport.Height;

                const layer = Utils.getLayer(enemy.y);
                const timeScale = me._getPlayerTimeScale(me._layer);
                enemy.tween.layer = layer;
                enemy.tween.setTimeScale(timeScale[layer]);
            });
    }

    _onButtonPush(first, second) {
        const me = this;

        const button = !!first.entity ? first : second;

        const pushed = button.entity.tryPush(me._entities);
        if (pushed)
            me._sound.tryPlaySingleton('button_push', Utils.getLayer(button.y));
    }

    _tryLookPhantom() {
        const me = this;

        let shift = 0;
        if (me._controls.isDownOnce(Enums.Keyboard.LOOK_PAST))
            shift = -1;
        else if (me._controls.isDownOnce(Enums.Keyboard.LOOK_FUTURE))
            shift = 1;

        if (shift == 0)
            return false;

        const nextLayer = me._layer + shift;
        if (nextLayer == me._layer || nextLayer < 0 || nextLayer >= Consts.Layers)
            return false;

        me._graphics.runPhantom(
            me._player.getPosition(),
            me._layer,
            nextLayer,
            me._entities);

        me._sound.play('phantom');

        return true;
    }

    _tryTeleport() {
        const me = this;

        let shift = 0;
        if (me._controls.isDownOnce(Enums.Keyboard.PAST_ACTION))
            shift = -1;
        else if (me._controls.isDownOnce(Enums.Keyboard.FUTURE_ACTION))
            shift = 1;

        const nextLayer = me._layer + shift;
        me._tryTeleportTo(nextLayer);
    }

    _tryTeleportTo(nextLayer) {
        const me = this;

        if (nextLayer == me._layer || nextLayer < 0 || nextLayer >= Consts.Layers)
            return;

        const target = me._player.canTeleport(nextLayer, me._scene.physics, me._entities.map);
        if (!target)
            return;

        me._sound.play('teleport');
        me._player.teleport(target, me._scene.tweens);
        me._graphics.runFade(
            me._player, 
            () => {
                me._scene.cameras.main.setScroll(0, nextLayer * Consts.Viewport.Height);
                me._player.setPositionY(target.y);
                me._layer = nextLayer;
                me._sound.setLayer(nextLayer);

                if (Config.DebugCameras) {
                    const first = nextLayer == 0 ? 1 : 0;
                    const second = nextLayer == 2 ? 1 : 2;

                    me._debugCameras[0].setScroll(
                        Consts.Viewport.Width / 2, 
                        first * Consts.Viewport.Height + Consts.Viewport.Height / 4);

                    me._debugCameras[1].setScroll(
                        Consts.Viewport.Width / 2, 
                        second * Consts.Viewport.Height + Consts.Viewport.Height / 4);
                }
            },
            () => {
                me._scene.sound.stopByKey('teleport');
            });

        const timeScale = me._getPlayerTimeScale(nextLayer);
        me._entities.tweens.forEach((t) => {
            me._scene.tweens.add({
                targets: t,
                timeScale: {
                    getEnd: () => timeScale[t.layer],
                },
                duration: Config.Speed.Teleport
            });
        });
    }

    _getPlayerTimeScale(to) {
        switch (to) {
            case Enums.Layer.PAST:
                return [
                    1,
                    1 * Config.TimeScale,
                    2 * Config.TimeScale
                ];

            case Enums.Layer.PRESENT:
                return [
                    1 / (2 * Config.TimeScale),
                    1,
                    1 * Config.TimeScale
                ];

            case Enums.Layer.FUTURE:
                return [
                    1 / (4 * Config.TimeScale),
                    1 / (2 * Config.TimeScale),
                    1
                ];

            default:
                throw `Unknown layer ${to}`;
        }
    }
}