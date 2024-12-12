import Here from "../framework/Here.js";
import Enemy from "./Enemy.js";

export default class Enemies {
  /** @type {Phaser.Physics.Arcade.Group} */
  _pool;

  /** @type {Enemy[]} */
  _enemies = [];

  constructor(foo) {
    const me = this;

    me._pool = Here._.physics.add.group();

    // me._createEnemy(800, 600, foo);
    // me._createEnemy(100, 100, foo);
  }

  /**
   * @returns {Phaser.Physics.Arcade.Group}
   */
  getPool() {
    const me = this;
    return me._pool;
  }

  update() {
    const me = this;

    for (let i = 0; i < me._enemies.length; ++i) {
      me._enemies[i].update();
    }
  }

  _createEnemy(x, y, target) {
    const me = this;

    const enemy = new Enemy(me._pool, x, y, target);
    me._enemies.push(enemy);
  }
}
