import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Laser from './Laser.js';
import Movable from './Movable.js';
import Audio from './utils/Audio.js';
import Utils from './utils/Utils.js';

export default class GunLogic {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Number} */
    _shotCount;

    /** @type {Object[]} */
    _bullets;

    /** @type {Number} */
    _charge;

    /** @type {Audio} */
    _audio;

    /** @type {Laser} */
    _laser;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Physics.Arcade.Group} bulletGroup
     * @param {Number} charge
     * @param {Audio} audio
     */
    constructor(scene, bulletGroup, charge, audio) {
        const me = this;

        me._scene = scene;
        me._shotCount = 0;
        me._charge = charge;
        me._audio = audio;

        me._bullets = [];
        me._createBullet(scene, bulletGroup);
        me._createBullet(scene, bulletGroup);

        me._laser = new Laser(scene, me._bullets[0].sprite, me._bullets[1].sprite);
    }

    /**
     * @param {Phaser.Geom.Point} from 
     * @param {Number} look 
     * @param {Number} flipX 
     */
    tryShot(from, look, flipX) {
        const me = this;

        if (me._shotCount < 3 && me._charge <= 0) {
            me._audio.play('warning');
            me._laser.hide();
            return;
        }

        me._shotCount += 1;

        if (me._shotCount < 3) {
            me._charge = Math.max(0, me._charge - Config.GunShotCost);
            if (me._shotCount == 1)
                me._laser.hide();

            const bullet = me._bullets[me._shotCount - 1].sprite;
            bullet.body.setEnable(true);

            const velocityXSign = look === 0 ? flipX : 0;
            const velocityYSign = look === 0 ? 0 : look;

            bullet
                .setPosition(from.x, from.y)
                // .setVisible(true)
                .setVelocity(
                    velocityXSign * Config.Physics.BulletSpeed,
                    velocityYSign * Config.Physics.BulletSpeed
                );

            me._bullets[me._shotCount - 1].state = Enums.BulletState.FLY;

            me._laser.setVisibleNode(me._shotCount - 1, true);
            me._audio.play('laserShoot');
        } else {
            me._destroyBullets();
            me._laser.hide();
        }
    };

    /**
     * 
     * @param {Phaser.Physics.Arcade.Sprite} bullet 
     */
    onWallCollide(bullet) {
        const me = this;

        const index = bullet.ownerIndex;
        bullet.setVelocity(0);
        me._bullets[index].state = Enums.BulletState.ON_WALL;
        bullet.body.setEnable(false);

        me._checkShotResult();
    }

    onContainerCollide(bullet, container) {
        const me = this;

        const index = bullet.ownerIndex;
        bullet.setVelocity(0);
        bullet.body.setEnable(false);
        me._bullets[index].state = Enums.BulletState.ON_TARGET;
        me._bullets[index].target = container;
        me._laser.setTarget(index, container);

        me._checkShotResult();
    }

    charge(delta) {
        const me = this;

        me._charge = Math.min(
            Config.Start.MaxGunCharge, 
            me._charge + Config.GunChargeSpeed * delta / 1000);
    }

    getLaser() {
        const me = this;

        return me._laser;
    }

    _checkShotResult() {
        const me = this;

        const shotsComplete = Utils.all(
            me._bullets, 
            b => b.state === Enums.BulletState.ON_WALL || b.state === Enums.BulletState.ON_TARGET);
        if (!shotsComplete)
            return;

        const allOnWalls = Utils.all(
            me._bullets, 
            b => b.state === Enums.BulletState.ON_WALL);

        if (allOnWalls)
            me._destroyBullets();

        const first = me._bullets[0].sprite;
        const second = me._bullets[1].sprite;
        const middle = Utils.buildPoint(
            (first.x + second.x) / 2,
            (first.y + second.y) / 2);

        const firstBody = me._bullets[0].target;

        if (!!firstBody) {
            /** @type {Movable} */
            const movable = firstBody.owner;
            movable.moveTo(middle);
        }

        const secondBody = me._bullets[1].target;

        if (!!secondBody) {
            /** @type {Movable} */
            const movable = secondBody.owner;
            movable.moveTo(middle);
        }

        const isLaser = !!firstBody || !!secondBody;
        if (isLaser)
            me._laser.setVisiblePoints(true);
        else
            me._laser.hide();
        me._destroyBullets();
    }

    _destroyBullets() {
        const me = this;

        for (let i = 0; i < me._bullets.length; ++i) {
            const bullet = me._bullets[i].sprite;
            bullet
                .setVelocity(0)
                .setVisible(false)
                .body.setEnable(false);
            me._bullets[i].state = Enums.BulletState.NONE;
            me._bullets[i].target = null;
        }

        me._shotCount = 0;
    }

    /**
     * 
     * @param {Phaser.Scene} scene 
      @param {Phaser.Physics.Arcade.Group} bulletGroup
     */
      _createBullet(scene, bulletGroup) {
        const me = this;

        const bullet = bulletGroup.create(0, 0, 'main', 1);
        bullet
            .setDepth(Consts.Depth.Laser)
            .setVisible(false)
            .body.setEnable(false);

        bullet.ownerIndex = me._bullets.length;

        me._bullets.push({
            sprite: bullet,
            state: Enums.BulletState.NONE,
            target: null
        });
    }
}