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

    // free sound from https://pixabay.com/
    // base color: #0F743C
    // black color: #1d1d35
    // red color: #ba3134

    me._isRestart = !!data.isRestart;
  }

  preload() {
    super.preload();
    const me = this;

    if (!me._isRestart) Utils.runLoadingBar();

    Utils.loadSpriteSheet("tiles", 40);
    Utils.loadSpriteSheet("phoneTube", 500, 200);

    Utils.loadImage("phoneBack");
    Utils.loadImage("phoneFront");
    Utils.loadImage("phoneLimiter");
    Utils.loadImage("dungeon");

    Utils.loadMp3("circleIncrease");
    Utils.loadMp3("circleDecrease");
    Utils.loadMp3("tubePickUp");
    Utils.loadMp3("tubePullDown");
    Utils.loadMp3("walk");
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
