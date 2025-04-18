import Phaser from '../../lib/phaser.js';
import Soldier from './Soldier.js';

export default class SoldierPool {

    _scene;

    constructor(scene) {
        const me = this;

        me._scene = scene;
    }

    getNext() {
        const me = this;
        
        const soldier = new Soldier(me._scene, 500, 500); //TODO
        return soldier;
    }

    /**
     * @param {Soldier} soldier 
     */
    release(soldier) {
        const me = this;

        soldier.dispose(); //TOOD
    }
}