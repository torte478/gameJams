import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";

export default class DrumMachine {
  /** @type {Phaser.Cameras.Scene2D.Camera} */
  _camera;

  /** @type {Phaser.GameObjects.Graphics} */
  _graphics;

  /** @type {Boolean[][]} */
  _loop;

  /** @type {Phaser.GameObjects.Image} */
  _indicator;

  _loopLength = 16; // TODO ?

  constructor() {
    const me = this;
    me._camera = Here._.cameras.add(
      0,
      Consts.Viewport.Height - Consts.DrumMachine.ViewHeight,
      Consts.Viewport.Width,
      Consts.DrumMachine.ViewHeight
    );
    me._camera.setBackgroundColor("#84A591").setScroll(-1000, 0);

    me._indicator = Here._.add.image(
      Consts.DrumMachine.StartPosX,
      Consts.DrumMachine.StartPosY - Consts.DrumMachine.CellSize / 2,
      "indicator"
    );

    me._moveIndicatorToBit(0);

    me._graphics = Here._.add.graphics();
    me._graphics.lineStyle(2, "#000000", 1);

    for (let i = 0; i < Consts.DrumMachine.SampleCount; ++i) {
      for (let j = 0; j < me._loopLength; ++j) {
        const pos = {
          x: Consts.DrumMachine.StartPosX + j * Consts.DrumMachine.CellSize,
          y: Consts.DrumMachine.StartPosY + i * Consts.DrumMachine.CellSize,
        };
        me._graphics.strokeRect(
          pos.x,
          pos.y,
          Consts.DrumMachine.CellSize,
          Consts.DrumMachine.CellSize
        );
      }
    }
  }

  update(time) {
    const me = this;
  }

  onPointerDown(x, y) {
    const me = this;

    const i = Math.floor(
      (y - Consts.DrumMachine.StartPosY) / Consts.DrumMachine.CellSize
    );
    const j = Math.floor(
      (x - Consts.DrumMachine.StartPosX) / Consts.DrumMachine.CellSize
    );

    // TODO
    if (
      i < 0 ||
      i >= Consts.DrumMachine.SampleCount ||
      j < 0 ||
      j >= me._loopLength
    )
      return;

    const pos = me._cellToWorldPos(i, j);
    me._graphics.fillStyle(0xff0000, 1);
    me._graphics.fillRect(
      pos.x,
      pos.y,
      Consts.DrumMachine.CellSize,
      Consts.DrumMachine.CellSize
    );
  }

  _moveIndicatorToBit(index) {
    const me = this;

    const pos = me._cellToWorldPos(-1, index);
    me._indicator.setPosition(
      pos.x + Consts.DrumMachine.CellSize / 2,
      me._indicator.y
    );
  }

  _cellToWorldPos(i, j) {
    const me = this;

    return {
      x: Consts.DrumMachine.StartPosX + j * Consts.DrumMachine.CellSize,
      y: Consts.DrumMachine.StartPosY + i * Consts.DrumMachine.CellSize,
    };
  }
}
