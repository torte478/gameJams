import Here from "../framework/Here.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Player from "./Player.js";

export default class LevelComponent {
  /** @type {Player} */
  _player;

  /** @type {Phaser.Math.Vector2} */
  _playerTilePos;

  /** @type {Phaser.Tilemaps.TilemapLayer} */
  _tilemapLayer;

  constructor() {
    const me = this;

    const map = Here._.add.tilemap(
      "test_level",
      Consts.Unit.Normal,
      Consts.Unit.Normal
    );
    const tileset = map.addTilesetImage("tiles");
    me._tilemapLayer = map.createLayer(
      0,
      tileset,
      Consts.Unit.Normal * 2,
      Consts.Unit.Normal
    );

    me._playerTilePos = { x: 2, y: 7 };
    me._player = new Player();
    const pos = me._getTileCenter(me._playerTilePos.x, me._playerTilePos.y);
    me._player.toGameObject().setPosition(pos.x, pos.y);
  }

  applySamples(samples) {
    const me = this;

    for (let i = 0; i < samples.length; ++i) {
      const sample = samples[i];
      switch (sample) {
        case Enums.SampleCommands.HIT:
          break;
        case Enums.SampleCommands.TURN:
          me._player.turn();
          break;
        case Enums.SampleCommands.JUMP:
          break;
        case Enums.SampleCommands.WALK:
          me._applyWalkCommand();
          break;
        default:
          throw sample;
      }
    }
  }

  _applyWalkCommand() {
    const me = this;

    const forwardTilePos = {
      x: me._playerTilePos.x + me._player.direction,
      y: me._playerTilePos.y,
    };
    const forwardTile = me._tilemapLayer.getTileAt(
      forwardTilePos.x,
      forwardTilePos.y
    );
    if (!forwardTile || forwardTile.index === 1)
      // TODO: solid tiles
      return;

    me._playerTilePos = forwardTilePos;
    const pos = me._getTileCenter(me._playerTilePos.x, me._playerTilePos.y);
    me._player.toGameObject().setPosition(pos.x, pos.y);
  }

  _getTileCenter(tileX, tileY) {
    const me = this;

    const pos = me._tilemapLayer.tileToWorldXY(tileX, tileY);
    return {
      x: pos.x + Consts.Unit.Normal / 2,
      y: pos.y + Consts.Unit.Normal / 2,
    };
  }
}
