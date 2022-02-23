import Phaser from '../../lib/phaser.js';

import Button from './Button.js';
import ButtonConfig from './ButtonConfig.js';
import Door from './Door.js';
import Portal from './Portal.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import LevelMap from '../LevelMap.js';
import Utils from '../Utils.js';


export default class Entities {

    /** @type {Set<Phaser.Tweens.Tween>} */
    tweens;

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

    /** @type {Phaser.Physics.Arcade.Group} */
    enemies;

    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    portals;

    /** @type {LevelMap} */
    map;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Object} config 
     */
    constructor(scene, config) {
        const me = this;

        me.tweens = new Set();

        me.map = new LevelMap(scene);

        me.doors = scene.physics.add.staticGroup();
        me._build(config.doors, (cfg) => {
            new Door(cfg.id, me.doors, cfg.x, cfg.y, cfg.horizontal, scene.sound);
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
            me.exits.create(cfg.x, cfg.y, 'items', 8);
        });

        me.turrets = scene.add.group();
        me.bullets = scene.physics.add.group();
        me._build(config.turrets, (cfg) => me._createTurret(cfg, scene));

        me.enemies = scene.physics.add.group();
        me._build(config.enemies, (cfg) => {
            const enemy = me.enemies.create(cfg.x, cfg.y, 'sprites', 10);
            enemy.play('enemy_run');
            enemy.setFlipX(cfg.flip);
            enemy.body.setAllowGravity(false); // TODO : disable global gravity

            const enemyDuration = Math.abs(enemy.x - 75) / Config.Speed.Enemy * 1000;

            const tween = scene.tweens.add({
                targets: enemy,
                x: cfg.target,
                yoyo: true,
                repeat: -1,
                flipX: true,
                duration: enemyDuration
            });

            enemy.tween = tween;
            tween.layer = Utils.getLayer(cfg.y);
            me.tweens.add(tween);
        });

        me.portals = scene.physics.add.staticGroup();
        me._build(config.portals, (cfg) => {
            new Portal(cfg.id, me.portals, cfg.x, cfg.y, cfg.toFuture);
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

    /**
     * @param {Object} cfg 
     * @param {Phaser.Scene} scene 
     */
    _createTurret(cfg, scene) {
        const me = this;

        /** @type {Phaser.GameObjects.Sprite} */
        const turret = me.turrets.create(cfg.x, cfg.y, 'enemy', 1);
        turret.setFlipX(cfg.flip);
        turret.play('turret_fire');
        turret.playAfterRepeat('turret_idle');

        const bullet = me.bullets.create(cfg.x, cfg.y, 'small', 0);
        bullet.body.setAllowGravity(false); // TODO
        bullet.play('bullet');

        const target = cfg.flip
            ? 0 - Consts.Unit.Small
            : Consts.Viewport.Width + Consts.Unit.Small;

        const layer = Utils.getLayer(cfg.y);
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
                if (!me.map.isFree(bullet.getBounds())) {
                    bulletTween.restart();
                    turret.play('turret_fire');
                    turret.playAfterRepeat('turret_idle');
                    scene.sound.play('turret_shot');
                }
            }})
            .setTimeScale(timeScale);

        bullet.parentTween = bulletTween;
        bullet.turret = turret;

        bulletTween.layer = layer;
        me.tweens.add(bulletTween);
    }
}