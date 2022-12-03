import Config from './Config.js';
import EnemyBehaviour from './EnemyBehaviour.js';
import Enums from './Enums.js';

export default class SquareBehabiour extends EnemyBehaviour {

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
     * @param {Phaser.Physics.Arcade.Group} group
     * @param {Number} x 
     * @param {Number} y 
     */
     create(group, x, y) {

        const sprite = group.create(x, y, 'square', 0)
            .setCollideWorldBounds(true)
            .setBounce(0.5);

        sprite.setVelocityX(-Config.Physics.SquareSpeed);

        return sprite;
    }

    getSize() {
        return Config.EnemySize[Enums.EnemyType.SQUARE];
    }
}
