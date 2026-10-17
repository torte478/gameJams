import Animation from "../framework/Animation.js";
import HereScene from "../framework/HereScene.js";
import Utils from "../framework/Utils.js";
import Consts from "../game/Consts.js";

import Game from "../game/Game.js";

export default class GameScene extends HereScene {
  /** @type {Game} */
  _game;

  /** @type {Boolean} */
  _isRestart;

  constructor() {
    super("gameScene");
  }

  init(data) {
    const me = this;

    me._isRestart = !!data.isRestart;
  }

  preload() {
    super.preload();
    const me = this;

    if (!me._isRestart) Utils.runLoadingBar();

    Utils.loadSpriteSheet("tiles", Consts.Unit.Normal);

    Utils.loadImage("phoneBack");
    Utils.loadImage("phoneFront");
    Utils.loadImage("phoneLimiter");
    Utils.loadImage("phoneTube");

    Utils.loadWav("button_click");
  }

  create() {
    const me = this;

    Animation.init();

    me._game = new Game();
  }

  update(time, deltaTime) {
    super.update();

    const me = this;

    me._game.update(time, deltaTime);
  }
}
