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
        me._pool = scene.physics.add.group();
        me._skinIndex = 0;
        me._level = status.level;
        me._clickCallback = clickCallback;
        me._scope = scope;
    }

    spawn(pos, level) {
        const me = this;

        let skin = me._skinIndex % Consts.Citizen.SkinCount;
        if (level == Consts.LastLevel)
            skin = 0;

        me._skinIndex++;
        const citizen = new Citizen(me._scene, me._pool, pos, skin, me._level, me._clickCallback, me._scope);

        Phaser.Actions.Call(me._pool.getChildren(), b => b.body.onWorldBounds = true);
    }

    killAndHide(citizen) {
        const me = this;

        citizen.dispose(me._pool);
    }

    destroyAll() {
        const me = this;

        me._pool.getChildren().map(c => me.killAndHide(c.father));
    }
}