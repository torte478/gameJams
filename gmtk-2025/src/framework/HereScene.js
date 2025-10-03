import Here from "./Here.js";

export default class HereScene extends Phaser.Scene {
  /**
   * @param {String} sceneName
   */
  constructor(sceneName) {
    super(sceneName);
  }

  preload() {
    const me = this;

    Here.init(me);
  }

  update(time, delta) {
    const me = this;

    Here.Controls.update(); // TODO: to template
  }
}
