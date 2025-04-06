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

    Utils.loadSpriteSheet("items", Consts.Unit.Normal);
    Utils.loadSpriteSheet("hand", 75);
    Utils.loadSpriteSheet("wall", Consts.Unit.Big);
    Utils.loadSpriteSheet("player_walk", Consts.Unit.Big);
    Utils.loadSpriteSheet("player_idle", Consts.Unit.Big);
    Utils.loadSpriteSheet("shop", Consts.Unit.Big);
    Utils.loadSpriteSheet("dark", Consts.Unit.Normal);
    Utils.loadSpriteSheet("fire", Consts.Unit.Big);
    Utils.loadSpriteSheet("icons", Consts.Unit.Normal);
    Utils.loadSpriteSheet("particles", 25);

    Utils.loadImage("bar");
    Utils.loadImage("mana_ball");
    Utils.loadImage("title");
    Utils.loadImage("arch");

    Utils.loadMp3("spot");
    Utils.loadMp3("sound");
    Utils.loadMp3("ambient");

    Utils.loadWav("bag_spawned");
    Utils.loadWav("take_garbage");
    Utils.loadWav("mana");
    Utils.loadWav("spot_problem");
    Utils.loadWav("mop");
    Utils.loadWav("mop_wash");
    Utils.loadWav("fireball_start");
    Utils.loadWav("fireball_explosion");
    Utils.loadWav("no_mana");

    me.load.tilemapCSV("map", "assets/map.csv");
  }

  create() {
    const me = this;

    Animation.init();

    me._game = new Game();
  }

  update(time, delta) {
    super.update();

    const me = this;

    me._game.update(time / 1000, delta / 1000);
  }
}
