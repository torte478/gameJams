import Phaser from '../lib/phaser.js';
import Config from './Config.js';

export default class EnemyBehaviour {
    
    /**
     * @param {Phaser.Physics.Arcade.Body} body 
     */
    update(body) {
        const me = this;

        if (body.blocked.right)
            body.setVelocityX(-Config.Physics.SquareSpeed);
        else if (body.blocked.left)
            body.setVelocityX(Config.Physics.SquareSpeed);
    }

    /**
     * @param {Phaser.Physics.Arcade.Body} body 
     */
    onStart(body) {
        const me = this;

        body.setVelocityX(-Config.Physics.SquareSpeed);
    }
}