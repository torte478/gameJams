import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
import Utils from '../utils/Utils.js';
import Citizen from './Citizen.js';

export default class CitizenPool {

    _scene;

    /** @type {Phaser.GameObjects.Group} */
    _pool;

    _skinIndex;

    _level;

    constructor(scene, status) {
        const me = this;
   
        me._scene = scene;
        me._pool = scene.add.group();
        me._skinIndex = 0;
        me._level = status.level;
    }

    getNext(pos) {
        const me = this;

        const skin = me._skinIndex % Consts.Citizen.SkinCount;
        me._skinIndex++;
        return new Citizen(me._scene, me._pool, pos, skin, me._level);
    }

    killAndHide(citizen) {
        const me = this;

        citizen.dispose(pool);
    }
}