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
    Utils.loadSpriteSheet("player", 70);
    Utils.loadSpriteSheet("spikes", Consts.Unit.Normal, Consts.Unit.Big);
    Utils.loadSpriteSheet("gun", Consts.Unit.Normal);
    Utils.loadSpriteSheet("trampoline", Consts.Unit.Normal, Consts.Unit.Big);
    Utils.loadSpriteSheet("finish_flag", Consts.Unit.Normal);
    Utils.loadSpriteSheet("barrels", Consts.Unit.Normal);
    Utils.loadSpriteSheet("temp_platform", Consts.Unit.Normal);
    Utils.loadSpriteSheet("pads", Consts.Unit.Normal);
    Utils.loadSpriteSheet("control", Consts.Unit.Normal);
    Utils.loadSpriteSheet("dragon_head", 300);
    Utils.loadSpriteSheet("particles", 25);

    Utils.loadImage("indicator");
    Utils.loadImage("death_icon");
    Utils.loadImage("info");
    Utils.loadImage("selection");
    Utils.loadImage("logo");
    Utils.loadImage("fade");
    Utils.loadImage("controlPanel");
    Utils.loadImage("dragon_hint");

    Utils.loadMp3("kick");
    Utils.loadMp3("crash");
    Utils.loadMp3("closed_hihat");
    Utils.loadMp3("rack_tom");
    Utils.loadMp3("snare");

    Utils.loadCsv("test_level");
    Utils.loadCsv("plain");
    Utils.loadCsv("shield_tutorial");
    Utils.loadCsv("trampoline_tutorial");
    Utils.loadCsv("trampoline_hell");
    Utils.loadCsv("turn_tutorial");
    Utils.loadCsv("cool_bit");
    Utils.loadCsv("rock_you");
    Utils.loadCsv("cool_16");
    Utils.loadCsv("transmit");
  }

  create() {
    const me = this;

    Animation.init();

    me._game = new Game();
  }

  update(time, delta) {
    super.update();

    const me = this;

    me._game.update(time, delta);
  }
}
