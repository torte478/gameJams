import Enums from "../game/Enums.js";
import Utils from "./Utils.js";

export default class Controls {
  static _schema = [
    { key: Enums.Keyboard.LEFT, value: Phaser.Input.Keyboard.KeyCodes.A },
    { key: Enums.Keyboard.RIGHT, value: Phaser.Input.Keyboard.KeyCodes.D },
    { key: Enums.Keyboard.UP, value: Phaser.Input.Keyboard.KeyCodes.W },
    { key: Enums.Keyboard.DOWN, value: Phaser.Input.Keyboard.KeyCodes.S },
    {
      key: Enums.Keyboard.ESC,
      value: Phaser.Input.Keyboard.KeyCodes.ESC,
    },
    { key: Enums.Keyboard.RESTART, value: Phaser.Input.Keyboard.KeyCodes.R },
  ];

  /** @type {KeyConfig[]} */
  _keys;

  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    const me = this;

    const keyboard = scene.input.keyboard;
    me._keys = Utils.buildArray(Controls._schema.length);
    for (let kv of Controls._schema) {
      me._keys[kv.key] = {
        key: keyboard.addKey(kv.value),
        justPressed: false,
      };
    }
  }

  update() {
    const me = this;

    for (let key of me._keys)
      key.justPressed = Phaser.Input.Keyboard.JustDown(key.key);
  }

  /**
   * @param {Number} key
   * @returns {Boolean}
   */
  isPressing(key) {
    const me = this;

    return me._keys[key].key.isDown;
  }

  /**
   * @param {Number} key
   * @returns {Boolean}
   */
  isPressedOnce(key) {
    const me = this;

    return me._keys[key].justPressed;
  }
}

class KeyConfig {
  /** @type {Phaser.Input.Keyboard.Key } */
  key;

  /** @type {Boolean} */
  justPressed;
}
