import Here from "./Here.js";
import ButtonConfig from "./ButtonConfig.js";
import Config from "../game/Config.js";
import Utils from "./Utils.js";

export default class Button {
  /** @type {ButtonConfig} */
  _config;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Phaser.GameObjects.Sprite} */
  _sprite;

  /** @type {Boolean} */
  _isClicked;

  /**
   * @param {ButtonConfig} config
   */
  constructor(config) {
    const me = this;

    me._config = config;
    me._isClicked = false;

    me._sprite = Here._.add.sprite(0, 0, config.texture, config.frameIdle);
    const children = [me._sprite];

    if (!!config.text) {
      const text = Here._.add
        .text(25, 0, config.text, {
          fontSize: 32,
          fontFamily: Config.FontFamily,
          color: Utils.colorNumberToString(Config.Color.Light),
        })
        .setOrigin(0.5, 0.5);

      children.push(text);
    }

    var bounds = me._sprite.getBounds();
    me._container = Here._.add
      .container(config.x, config.y, children)
      .setSize(bounds.width, bounds.height)
      .setInteractive();

    me._container.on("pointerdown", me._onButtonClick, me);
    me._container.on("pointerover", me._select, me);
    me._container.on("pointerout", me._unselect, me);
  }

  /** @type {Phaser.GameObjects.Container} */
  toGameObj() {
    const me = this;

    return me._container;
  }

  _onButtonClick() {
    const me = this;

    if (me._isClicked) return;

    me._container.setScale(0.75);
    me._isClicked = true;
    Here._.time.delayedCall(
      500,
      () => {
        me._container.setScale(1);
        me._isClicked = false;
      },
      me,
    );

    if (!!me._config.sound) Here.Audio.play(me._config.sound);

    Here._.time.delayedCall(200, me._config.callback, me._config.callbackScope);
  }

  _select() {
    const me = this;

    me._container.setScale(1.25);
  }

  _unselect() {
    const me = this;

    me._container.setScale(1);
  }
}
