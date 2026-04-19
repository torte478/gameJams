import Animation from "../framework/Animation.js";
import HereScene from "../framework/HereScene.js";
import Utils from "../framework/Utils.js";

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

    Utils.loadImage("signal");
    Utils.loadImage("rkn");
    Utils.loadImage("bullet");
    Utils.loadImage("boss");
    Utils.loadImage("redFade");
    Utils.loadImage("towerMenu");
    Utils.loadImage("towerMenuItem");

    Utils.loadImage("title");
    Utils.loadImage("hintConnectTowers");
    Utils.loadImage("hintDeleteChannel");
    Utils.loadImage("tentacle");

    Utils.loadSpriteSheet("tower", 50, 100);
    Utils.loadSpriteSheet("buttons", 150, 75);
    Utils.loadSpriteSheet("tape", 1200, 200);
    Utils.loadSpriteSheet("digits", 100);

    Utils.loadWav("damage");
    Utils.loadWav("pointerDown");
    Utils.loadWav("pointerUp");

    Utils.loadMp3("musicRadio");
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
