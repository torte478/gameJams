import Phaser from '../lib/phaser.js';

export default class EnemyBehaviour {
    
    /**
     * @param {Phaser.Physics.Arcade.Body} body 
     */
    update(body) {
        throw 'not implemented';
    }

    
    /**
     * @param {Phaser.Physics.Arcade.Group} group
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Phaser.Physics.Arcade.Sprite}
     */
    create(group, x, y) {
        throw 'not implemented';
    }

    getSize() {
        throw 'not implemented';
    }
}