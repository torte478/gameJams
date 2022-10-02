import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
import Graphics from '../Graphics.js';
import Reserve from '../Reserve.js';
import Status from '../Status.js';
import Utils from '../utils/Utils.js';
import Citizen from './Citizen.js';
import CitizenPool from './CitizenPool.js';

export default class City {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {CitizenPool} */
    _citizenPool;

    /** @type {Reserve} */
    _reserve;

    /** @type {Status} */
    _status;

    /** @type {Phaser.Geom.Point} */
    _cemetryPos;

    /** @type {Boolean[][]} */
    _cemetry;

    /** @type {Graphics} */
    _graphics;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Status} status
     * @param {Reserve} reserve
     * @param {Graphics} graphics
     */
    constructor(scene, status, reserve, graphics) {
        const me = this;

        me._scene = scene;
        me._reserve = reserve;
        me._status = status;
        me._graphics = graphics;

        scene.add.image(-Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'city_background')
            .setDepth(Consts.Depth.Background);

        scene.physics.world.setBounds(
            Consts.Citizen.LeftX,
            0,
            Consts.Citizen.RightX - Consts.Citizen.LeftX,
            Consts.Viewport.Height);

        scene.physics.world.on('worldbounds', me._onWorldBounds);

        me._citizenPool = new CitizenPool(scene, status, me._onCitizenClick, me);

        me._reserve.emitter.on('coffinClick', me._onReserveClick, me);

        me._cemetryPos = Utils.buildPoint(-900, 550);
        const width = Math.floor((-100 - (-900)) / Consts.Unit);
        const height = Math.floor((720 - 550) / Consts.Unit);

        me._cemetry = [];
        for (let i = 0; i < height; ++i) {
            const row = [];
            for (let j = 0; j < width; ++j)
                row.push(false);
            me._cemetry.push(row);
        }
    }

    resume() {
        const me = this;

        const count = Math.min(me._status.avaialbeCitizens, Consts.Citizen.MaxCountPerScreen);
        for (let i = 0; i < count; ++i) {
            const position = Utils.buildPoint(
                Utils.getRandom(Consts.Citizen.LeftX, Consts.Citizen.RightX),
                Utils.getRandom(Consts.Citizen.UpY, Consts.Citizen.DownY));

            me._citizenPool.spawn(position);
        }
    }

    pause() {
        const me = this;

        me._citizenPool.destroyAll();
    }

    _onCitizenClick(citizen) {
        const me = this;

        if (me._status.isBusy)
            return;

        if (!me._reserve.hasEmptyPlace())
            return;

        me._status.busy();
        citizen.disableBody();
        me._reserve.addSoldier(citizen, me._onSoldierAdd, me);
    }

    _onSoldierAdd(citizen) {
        const me = this;

        me._citizenPool.killAndHide(citizen);
        me._status.avaialbeCitizens -= 1;
        me._status.free();
    }

    _onWorldBounds(body) {
        /** @type {Phaser.Physics.Arcade.Sprite} */
        const sprite = body.gameObject;

        sprite.setFlipX(!sprite.flipX);
    }

    _onReserveClick() {
        const me = this;

        if (me._status.isBusy || !me._status.isCity)
            return;

        me._status.busy();

        const available = [];
        for (let i = 0; i < me._cemetry.length; ++i)
            for (let j = 0; j < me._cemetry[i].length; ++j)
                if (!me._cemetry[i][j])
                    available.push({i: i, j: j});

        const index = Utils.getRandomEl(available);

        const position = me._reserve.removeCoffin();
        const coffin = me._graphics.createCoffin(position);
        const target = Utils.buildPoint(
            me._cemetryPos.x + index.j * Consts.Unit,
            me._cemetryPos.y + index.i * Consts.Unit);

        me._scene.add.tween({
            targets: coffin,
            x: target.x,
            y: target.y,
            ease: 'Sine.easeInOut',
            duration: Consts.Speed.Reserve,
            onComplete: () => {
                me._graphics.createGrave(target);
                me._graphics.killAndHide(coffin);
                me._cemetry[index.i][index.j] = true;
                me._status.free();
            }
        })
    }
}