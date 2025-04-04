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

    Utils.loadWav("button_click");

    Utils.loadSpriteSheet("step", Consts.Sizes.Cell);
    Utils.loadSpriteSheet("bonuses", 40);
    Utils.loadSpriteSheet("level1_anim", 50);
    Utils.loadSpriteSheet("level2", 100);
    Utils.loadSpriteSheet("level3", 150);
    Utils.loadSpriteSheet("level4", 150);
    Utils.loadSpriteSheet("bullet", 50);
    Utils.loadSpriteSheet("digits", 100);

    Utils.loadImage("grid");
    Utils.loadImage("background");
    Utils.loadImage("mapPointer");
    Utils.loadImage("boss");

    Utils.loadWav("click");
    Utils.loadWav("transition");
    Utils.loadWav("lose");
    Utils.loadWav("draw");
    Utils.loadWav("win");
    Utils.loadWav("gameover");

    Utils.loadMp3("level1");
    Utils.loadMp3("level2");
    Utils.loadMp3("level3");
    Utils.loadMp3("level4");
  }

  create() {
    const me = this;

    Animation.init();

    me._game = new Game();
  }

  update() {
    super.update();

    const me = this;

    me._game.update();
  }
}
