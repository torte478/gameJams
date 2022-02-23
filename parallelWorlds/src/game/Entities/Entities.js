import Phaser from '../../lib/phaser.js';

import Button from './Button.js';
import ButtonConfig from './ButtonConfig.js';
import Door from './Door.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Utils from '../Utils.js';

export default class Entities {

    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    doors;

    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    buttons;

    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    exits;

    /** @type {Phaser.GameObjects.Group} */
    turrets;

    /** @type {Phaser.Physics.Arcade.Group} */
    bullets;

    /** @type {Set<Phaser.Tweens.Tween>} */
    tweens;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Object} config 
     * @param {Phaser.Tilemaps.Tilemap} level
     */
    constructor(scene, config, level) {
        const me = this;

        me.tweens = new Set();

        me.doors = scene.physics.add.staticGroup();
        me._build(config.doors, (cfg) => {
            new Door(cfg.id, me.doors, cfg.x, cfg.y, cfg.horizontal);
        });    

        me.buttons = scene.physics.add.staticGroup();
        me._build(config.buttons, (cfg) => {
            const buttonConfig = new ButtonConfig();
            buttonConfig.doorsToOpen = cfg.doorsToOpen || [];
            buttonConfig.doorsToClose = cfg.doorsToClose || [];
            buttonConfig.buttonsToPush = cfg.buttonsToPush || [];
            buttonConfig.buttonsToPull = cfg.buttonsToPull || [];

            new Button(cfg.id, me.buttons, cfg.x, cfg.y, cfg.angle, buttonConfig);
        });

        me.exits = scene.physics.add.staticGroup();
        me._build(config.exits, (cfg) => {
            me.exits.create(cfg.x, cfg.y, 'sprites', 11);
        });

        me.turrets = scene.add.group();
        me.bullets = scene.physics.add.group();
        me._build(config.turrets, (cfg) => {
            /** @type {Phaser.GameObjects.Sprite} */
            const turret = me.turrets.create(cfg.x, cfg.y, 'sprites', 1);
            turret.setFlipX(cfg.flip);

            const bullet = me.bullets.create(cfg.x, cfg.y, 'sprites_small')
            bullet.body.setAllowGravity(false); // TODO

            const target = cfg.flip
                ? 0 - Consts.Unit.Small
                : Consts.Viewport.Width + Consts.Unit.Small;

            const layer = Math.floor(cfg.y / Consts.Viewport.Height);
            const timeScale = layer == Enums.Layer.PRESENT
                ? 1
                : layer == Enums.Layer.PAST ? 1 / Config.TimeScale : Config.TimeScale;

            const speed = Config.Speed.Bullet * (!!cfg.speed ? cfg.speed : 1);

            const bulletTween = scene.tweens.add({
                targets: bullet,
                x: { from: cfg.x, to: target },
                duration:Math.abs(target - cfg.x) / speed * 1000,
                repeat: -1,
                onUpdate: () => {
                    if (!Utils.isTileFree(bullet.getBounds(), level))
                        bulletTween.restart();
                }})
                .setTimeScale(timeScale);

            bullet.parentTween = bulletTween;

            bulletTween.layer = layer;
            me.tweens.add(bulletTween);
        });
    }

    _build(config, f) {
        if (!config || !config.length)
            return;

        for (let i = 0; i < config.length; ++i) {
            const item = config[i];
            f(item);
        }
    }
}