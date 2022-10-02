import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
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

    _citizenCount;

    /** @type {Reserve} */
    _reserve;

    /** @type {Status} */
    _status;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Status} status
     * @param {Reserve} reserve
     */
    constructor(scene, status, reserve) {
        const me = this;

        me._scene = scene;
        me._reserve = reserve;
        me._status = status;

        scene.add.image(-Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'city_background')
            .setDepth(Consts.Depth.Background);

        scene.physics.world.setBounds(
            Consts.Citizen.LeftX,
            0,
            Consts.Citizen.RightX - Consts.Citizen.LeftX,
            Consts.Viewport.Height);

        scene.physics.world.on('worldbounds', me._onWorldBounds);

        me._citizenPool = new CitizenPool(scene, status, me._onCitizenClick, me);       
        me._citizenCount = Config.Levels[status.level].CitizenCount;
    }

    resume() {
        const me = this;

        const count = Math.min(me._citizenCount, Consts.Citizen.MaxCountPerScreen);
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
        me._citizenCount -= 1;
        me._status.free();
    }

    _onWorldBounds(body) {
        /** @type {Phaser.Physics.Arcade.Sprite} */
        const sprite = body.gameObject;

        sprite.setFlipX(!sprite.flipX);
    }
}