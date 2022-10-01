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
        
        const soldier = new Soldier(me._scene); //TODO
        return soldier;
    }
}