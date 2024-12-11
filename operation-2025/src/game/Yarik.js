import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Enums from "./Enums.js";

export default class Yarik {
  /** @type{Phaser.GameObjects.Container} */
  _container;

  constructor() {
    const me = this;

    const sprite = Here._.add.image(0, 0, "placeholder80", 0);

    me._container = Here._.add
      .container(400, 300, [sprite])
      .setSize(sprite.width, sprite.height);

    Here._.physics.world.enable(me._container);

    me._getBody().pushable = false;
  }

  /**
   * @returns {Phaser.GameObjects.Container}
   */
  getGameObject() {
    const me = this;
    return me._container;
  }

  update() {
    const me = this;

    let dx = 0;
    if (Here.Controls.isPressing(Enums.Keyboard.LEFT)) {
      dx = -1;
    } else if (Here.Controls.isPressing(Enums.Keyboard.RIGHT)) {
      dx = +1;
    }

    let dy = 0;
    if (Here.Controls.isPressing(Enums.Keyboard.UP)) {
      dy = -1;
    } else if (Here.Controls.isPressing(Enums.Keyboard.DOWN)) {
      dy = +1;
    }

    const factor = Utils.normalize(dx, dy);
    me._getBody().setVelocity(
      Config.Yarik.Speed * dx * factor,
      Config.Yarik.Speed * dy * factor
    );
  }

  /**
   * @returns {Phaser.Physics.Arcade.Body}
   */
  _getBody() {
    const me = this;
    return me._container.body;
  }
}
