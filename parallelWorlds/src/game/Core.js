import Phaser from '../lib/phaser.js';

import Button from './Entities/Button.js';
import ButtonConfig from './Entities/ButtonConfig.js';
import Door from './Entities/Door.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';
import Player from './Player.js';
import Utils from './Utils.js';
import Entities from './Entities/Entities.js';
import Levels from './Levels/Levels.js';

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

    /** @type {Phaser.GameObjects.Image} */
    _fade; 

    /** @type {Phaser.Tweens.Tween[][]}*/
    _layers;

    /** @type {Phaser.Cameras.Scene2D.Camera[]} */
    _debugCameras;

    /** @type {Phaser.GameObjects.Group} */
    _phantom;

    /** @type {Entities} */
    _entities;

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

        me._level = me._scene.make.tilemap({
            key: 'level',
            tileWidth: Consts.Unit.Small,
            tileHeight: Consts.Unit.Small
        });

        me._fade = scene.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'fade')
            .setDepth(Consts.Depth.Fade)
            .setScrollFactor(0)
            .setAlpha(0);

        me._phantom = scene.add.group();

        const tileset = me._level.addTilesetImage('tiles');
        const tiles = me._level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Tiles);

        me._level.setCollisionBetween(1, 3);

        me._scene.physics.add.collider(me._player.getCollider(), tiles);

        me._layers = [ [], [], [] ];

        me._entities = new Entities(scene, Levels.Config[levelIndex], me._level);

        me._scene.physics.add.overlap(me._player.getCollider(), me._entities.bullets, (p, b) => {
            b.parentTween.restart();
            console.log('hit');
        });

        me._scene.physics.add.overlap(
            me._player.getCollider(), 
            me._entities.bullets,
            (p, b) => {
                b.parentTween.restart();
                console.log('hit');
        });
        
        me._scene.physics.add.collider(me._player.getCollider(), me._entities.doors);

        me._scene.physics.add.overlap(
            me._entities.buttons, 
            me._player.getCollider(),
            me._onButtonPush,
            () => true,
            me);

        me._scene.physics.add.overlap(
            me._entities.buttons,
            me._bulletGroup, 
            me._onButtonPush,
            () => true,
            me);

        me._scene.physics.add.overlap(
            me._player.getCollider(),
            me._entities.exits,
            () => { console.log('YOU WIN!!!') });

        // TODO : extract method (to factory?)
        const enemy = scene.physics.add.sprite(875, 2325, 'sprites', 10)
            .setFlipX(true);
        enemy.body.setAllowGravity(false); // TODO : disable global gravity

        const enemyDuration = Math.abs(enemy.x - 75) / Config.Speed.Enemy * 1000;

        scene.physics.add.overlap(me._player.getCollider(), enemy, () => {
            console.log('You lose!')
        });

        me._layers[2].push(scene.tweens.add({
            targets: enemy,
            x: 75,
            yoyo: true,
            repeat: -1,
            flipX: true,
            duration: enemyDuration
        }));

        const portal1 = scene.physics.add.staticImage(475, 2325, 'sprites', 9);
        const portal2 = scene.physics.add.staticImage(700, 1525, 'sprites', 9);
        const portal3 = scene.physics.add.staticImage(250, 1525, 'sprites', 8);
        const portal4 = scene.physics.add.staticImage(475, 725, 'sprites', 8);

        scene.physics.add.overlap(portal1, enemy, () => {
            enemy.y -= 800;
        });

        scene.physics.add.overlap(portal2, enemy, () => {
            enemy.y -= 800;
        });

        scene.physics.add.overlap(portal3, enemy, () => {
            enemy.y += 800;
        });

        scene.physics.add.overlap(portal4, enemy, () => {
            enemy.y += 800;
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

        for (let i = 0; i < me._layers[nextLayer].length; ++i)
            for (let j = 0; j < me._layers[nextLayer][i].targets.length; ++j) {
                /** @type {Phaser.GameObjects.Sprite} */
                const origin = me._layers[nextLayer][i].targets[j];

                /** @type {Phaser.GameObjects.Sprite} */
                const sprite = me._phantom.create(
                    origin.x, 
                    me._layer * Consts.Viewport.Height + origin.y % Consts.Viewport.Height, 
                    origin.texture, 
                    origin.frame.name);
                sprite.setFlipX(origin.flipX);

                targets.push(sprite);
            }

        const playerPos = me._player.getPosition();
        const playerY = nextLayer * Consts.Viewport.Height + playerPos.y % Consts.Viewport.Height;

        me._level.forEachTile((tile) => {    
                const x = tile.getCenterX();
                const originY = tile.getCenterY();
                
                const dist = Phaser.Math.Distance.Between(playerPos.x, playerY, x, originY);
            
                if (dist <= 200 && tile.canCollide) {
                    const y = me._layer * Consts.Viewport.Height + originY % Consts.Viewport.Height;
                    targets.push(me._phantom.create(x, y, 'tiles', tile.index));
                }
            },
            me,
            0,
            nextLayer * (Consts.Viewport.Height / Consts.Unit.Small),
            Consts.Viewport.Width / Consts.Unit.Small,
            Consts.Viewport.Height / Consts.Unit.Small,
            { isColliding: true });

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

        if (nextLayer == me._layer || nextLayer < 0 || nextLayer >= Consts.Layers)
            return;

        const target = me._player.canTeleport(nextLayer, me._scene.physics, me._level);
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