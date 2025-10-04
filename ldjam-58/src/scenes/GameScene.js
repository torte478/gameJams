import Animation from "../framework/Animation.js";
import Here from "../framework/Here.js";
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

    Utils.loadSpriteSheet("gnome", 200, 200);
    Utils.loadSpriteSheet("shelf", 200, 400);
    Utils.loadSpriteSheet("buttons", 100, 100);

    Utils.loadImage("order");
    Utils.loadImage("background");

    me.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );
  }

  create() {
    const me = this;

    Animation.init();

    me._game = new Game();
  }

  // TODO: to framework
  // TODO: I need my own button framework
  update(time, delta) {
    super.update();

    const me = this;

    me._game.update(time, delta);
  }
}
