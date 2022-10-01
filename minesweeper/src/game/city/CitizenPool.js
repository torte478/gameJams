import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';
import Citizen from './Citizen.js';

export default class CitizenPool {

    _scene;

    /** @type {Phaser.GameObjects.Group} */
    _pool;

    _skinIndex;

    _level;

    _clickCallback;
    _scope;

    constructor(scene, status, clickCallback, scope) {
        const me = this;
   
        me._scene = scene;
        me._pool = scene.add.group();
        me._skinIndex = 0;
        me._level = status.level;
        me._clickCallback = clickCallback;
        me._scope = scope;
    }

    getNext(pos) {
        const me = this;

        const skin = me._skinIndex % Consts.Citizen.SkinCount;
        me._skinIndex++;
        return new Citizen(me._scene, me._pool, pos, skin, me._level, me._clickCallback, me._scope);
    }

    killAndHide(citizen) {
        const me = this;

        citizen.dispose(me._pool);
    }
}