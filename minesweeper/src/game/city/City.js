import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
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

    /** @type {Citizen[]} */
    _citizens;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Status} status
     */
    constructor(scene, status) {
        const me = this;

        me._scene = scene;

        scene.add.image(-Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'city_background')
            .setDepth(Consts.Depth.Background);

        scene.physics.world.setBounds(
            Consts.Citizen.LeftX,
            0,
            Consts.Citizen.RightX - Consts.Citizen.LeftX,
            Consts.Viewport.Height);

        me._citizenPool = new CitizenPool(scene, status);       
        me._citizenCount = Config.Levels[status.level].CitizenCount;

        me._citizens = [];
    }

    spawnCitizens() {
        const me = this;


        const count = Math.min(me._citizenCount, Consts.Citizen.MaxCountPerScreen);
        for (let i = 0; i < count; ++i) {
            const position = Utils.buildPoint(
                Utils.getRandom(Consts.Citizen.LeftX, Consts.Citizen.RightX),
                Utils.getRandom(Consts.Citizen.UpY, Consts.Citizen.DownY));

            const citizen = me._citizenPool.getNext(position);
            me._citizens.push(citizen);
        }
    }
}