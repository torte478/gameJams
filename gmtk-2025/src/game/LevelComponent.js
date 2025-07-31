import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
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

  _isReset = false;

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

    me._player = new Player();

    me.reset();
  }

  applyBitChange(commands, currentBit) {
    const me = this;

    if (me._isReset && currentBit != 0) return;

    me._isReset = false;

    if (Utils.all(commands, (c) => !c)) return me._player.toIdle();

    if (commands[Enums.SampleCommands.WALK]) return me._applyWalkCommand();

    if (commands[Enums.SampleCommands.TURN]) return me._player.turn();

    if (commands[Enums.SampleCommands.SHIELD]) return me._player.toShield();

    if (commands[Enums.SampleCommands.ATTACK]) return me._player.toAttack();
  }

  reset() {
    const me = this;

    me._isReset = true;

    me._playerTilePos = { x: 2, y: 6 };
    const pos = me._getTileCenter(me._playerTilePos.x, me._playerTilePos.y);
    me._player.toGameObject().setPosition(pos.x, pos.y);
    me._player.toIdle();
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
    // TODO: solid tiles
    if (!forwardTile || forwardTile.index === 1) return;

    me._player.toIdle();
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
