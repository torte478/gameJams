import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';
import Corpse from './Corpse.js';

export default class CorpsePool {

    _scene;

    /** @type {Phaser.GameObjects.Group} */
    _pool;

    constructor(scene) {
        const me = this;

        me._scene = scene;
        me._pool = scene.add.group();
    }
    
    getNext(pos, type) {
        const me = this;

        return new Corpse(me._scene, pos, me._pool, 7, 8);
    }
}