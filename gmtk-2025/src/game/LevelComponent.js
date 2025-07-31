import Here from "../framework/Here.js";
import Consts from "./Consts.js";
import Player from "./Player.js";

export default class LevelComponent {
  /** @type {Player} */
  _player;

  constructor() {
    const me = this;

    const map = Here._.add.tilemap(
      "test_level",
      Consts.Unit.Normal,
      Consts.Unit.Normal
    );
    const tileset = map.addTilesetImage("tiles");
    const layer = map.createLayer(
      0,
      tileset,
      Consts.Unit.Normal * 2,
      Consts.Unit.Normal
    );

    me._player = new Player();
    const pos = layer.tileToWorldXY(2, 7);
    me._player
      .toGameObject()
      .setPosition(
        pos.x + Consts.Unit.Normal / 2,
        pos.y + Consts.Unit.Normal / 2
      );
  }
}
