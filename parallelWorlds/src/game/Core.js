import Phaser from '../lib/phaser.js';

import Entities from './Entities/Entities.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';
import Levels from './Levels.js';
import Player from './Player.js';
import Utils from './Utils.js';
import LevelMap from './LevelMap.js';

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

    /** @type {Phaser.GameObjects.Image} */
    _fade; 

    /** @type {Phaser.Cameras.Scene2D.Camera[]} */
    _debugCameras;

    /** @type {Phaser.GameObjects.Group} */
    _phantom;

    /** @type {LevelMap} */
    _map;

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

        me._map = new LevelMap(scene);

        me._fade = scene.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'fade')
            .setDepth(Consts.Depth.Fade)
            .setScrollFactor(0)
            .setAlpha(0);

        me._phantom = scene.add.group();

        me._entities = new Entities(scene, Levels.Config[levelIndex], me._map);

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
                
            me._debugCameras[0].ignore(me._fade);
            me._debugCameras[1].ignore(me._fade);
        }
    }

    update() {
        const me = this;

        me._controls.update();

        if (me._player.isBusy)
            return;

        // movement
        let signX = 0;
        if (me._controls.isDown(Enums.Keyboard.LEFT))
            signX = -1;
        else if (me._controls.isDown(Enums.Keyboard.RIGHT))
            signX = 1;

        me._player.setDirectionX(signX);

        if (me._controls.isDownOnce(Enums.Keyboard.JUMP))
            me._player.tryJump();

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
            me._map.getCollider());

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

        button.entity.tryPush(me._entities);
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

        const targets = [];

        me._entities.tweens.forEach((tween) => {
            for (let i = 0; i < tween.targets.length; ++i) {

                if (tween.layer != nextLayer)
                    continue;

                /** @type {Phaser.GameObjects.Sprite} */
                const origin = tween.targets[i];

                /** @type {Phaser.GameObjects.Sprite} */
                const sprite = me._phantom.create(
                    origin.x, 
                    me._layer * Consts.Viewport.Height + origin.y % Consts.Viewport.Height, 
                    origin.texture, 
                    origin.frame.name);
                sprite.setFlipX(origin.flipX);

                targets.push(sprite);
            }
        });

        const tiles = me._map.foo(
            me._player.getPosition(),
            200,
            me._layer,
            nextLayer);

        for (let i = 0; i < tiles.length; ++i) {
            const item = tiles[i]
            targets.push(me._phantom.create(item.x, item.y, 'tiles', item.index));
        }

        for (let i = 0; i < targets.length; ++i) {
            targets[i]
                .setDepth(Consts.Depth.Phantom)
                .setTintFill(nextLayer > me._layer ? 0xe9ac00 : 0x230fcf);
        }

        me._scene.tweens.add({
            targets: targets,
            alpha: { from: 1, to: 0 },
            duration: 2000,
            ease: 'Sine.easeOut',
            onComplete: () => {
                for (let obj in targets)
                    me._phantom.killAndHide(obj);
            }
        });

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

        const target = me._player.canTeleport(nextLayer, me._scene.physics, me._map);
        if (!target)
            return;

        me._player.teleport(target, me._scene.tweens);
        me._scene.tweens.createTimeline()
            .add({
                targets: me._fade,
                alpha: { from: 0, to: 1 },
                duration: Config.Speed.Teleport / 2,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    me._scene.cameras.main.setScroll(0, nextLayer * Consts.Viewport.Height);
                    me._player.setPositionY(target.y);
                    me._layer = nextLayer;

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
                }
            })
            .add({
                targets: me._fade,
                alpha: { from: 1, to: 0 },
                duration: Config.Speed.Teleport / 2,
                ease: 'Sine.easeOut',
            })
            .play();
            

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