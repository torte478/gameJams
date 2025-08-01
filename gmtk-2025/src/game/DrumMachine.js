import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import LevelConfig from "./LevelConfig.js";

export default class DrumMachine {
  /** @type {Phaser.Cameras.Scene2D.Camera} */
  _camera;

  /** @type {Phaser.GameObjects.Graphics} */
  _graphics;

  /** @type {Boolean[][]} */
  _loop;

  /** @type {Phaser.GameObjects.Image} */
  _indicator;

  /** @type {Number} */
  _currentBit = 0;

  /** @type {Number[]} */
  _resultBuffer;

  /** @type {Number} */
  loopLength = 8; // TODO ?

  /**
   * @param {LevelConfig} levelConfig
   */
  constructor(levelConfig) {
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

    me._resultBuffer = Utils.buildArray(4, false);

    me._loop = [];
    for (let i = 0; i < Consts.DrumMachine.SampleCount; ++i) {
      const line = Utils.buildArray(me.loopLength, false);
      me._loop.push(line);
    }

    // solution
    if (Utils.isDebug(Config.Debug.StartFromSolution)) {
      const solution = levelConfig.solution;
      for (let i = 0; i < solution.length; ++i)
        for (let j = 0; j < solution[i].length; ++j)
          me._loop[i][j] = !!solution[i][j];
    }

    me._graphics = Here._.add.graphics();
    me._graphics.lineStyle(2, "#000000", 1);

    for (let i = 0; i < Consts.DrumMachine.SampleCount; ++i) {
      const posY =
        Consts.DrumMachine.StartPosY + i * Consts.DrumMachine.CellSize;
      const text = Here._.add.text(
        Consts.DrumMachine.StartPosX - 60,
        posY,
        me._getSampleText(i)
      );

      for (let j = 0; j < me.loopLength; ++j) {
        me._drawCell(i, j);
      }
    }

    const bitTextPosY =
      Consts.DrumMachine.StartPosY + 4 * Consts.DrumMachine.CellSize;
    for (let j = 0; j < me.loopLength; ++j) {
      Here._.add.text(
        Consts.DrumMachine.StartPosX + j * Consts.DrumMachine.CellSize + 10,
        bitTextPosY + 5,
        `${j}`
      );
    }
  }

  update(bit, isWindowActive) {
    const me = this;

    if (bit == me._currentBit) return null;

    me._currentBit = bit;
    me._moveIndicatorToBit(bit);

    if (!Utils.isDebug(Config.Debug.DisableHihats) && isWindowActive) {
      Here.Audio.play("closed_hihat");
    }

    for (let i = 0; i < Consts.DrumMachine.SampleCount; ++i) {
      me._resultBuffer[i] = false;
      if (me._loop[i][bit]) {
        me._resultBuffer[i] = true;
        const sample = me._getSampleAudioName(i);

        if (isWindowActive) Here.Audio.play(sample);
      }
    }

    return me._resultBuffer;
  }

  onPointerDown(x, y) {
    const me = this;

    const i = Math.floor(
      (y - Consts.DrumMachine.StartPosY) / Consts.DrumMachine.CellSize
    );
    const j = Math.floor(
      (x - Consts.DrumMachine.StartPosX) / Consts.DrumMachine.CellSize
    );

    if (
      i < 0 ||
      i >= Consts.DrumMachine.SampleCount ||
      j < 0 ||
      j >= me.loopLength
    )
      return;

    // only one
    if (!me._loop[i][j]) {
      for (let k = 0; k < Consts.DrumMachine.SampleCount; ++k) {
        me._loop[k][j] = false;
        me._drawCell(k, j);
      }
    }

    me._loop[i][j] = !me._loop[i][j];
    me._drawCell(i, j);
  }

  _drawCell(i, j) {
    const me = this;

    const pos = me._cellToWorldPos(i, j);

    if (me._loop[i][j]) {
      me._graphics.fillStyle(0x0000ff, 1);
      me._graphics.fillRect(
        pos.x,
        pos.y,
        Consts.DrumMachine.CellSize,
        Consts.DrumMachine.CellSize
      );
    } else {
      me._graphics.fillStyle(0x84a591, 1);
      me._graphics.fillRect(
        pos.x,
        pos.y,
        Consts.DrumMachine.CellSize,
        Consts.DrumMachine.CellSize
      );

      me._graphics.lineStyle(2, "#000000", 1);
      me._graphics.strokeRect(
        pos.x,
        pos.y,
        Consts.DrumMachine.CellSize,
        Consts.DrumMachine.CellSize
      );
    }
  }

  _getSampleAudioName(index) {
    const me = this;
    switch (index) {
      case Enums.Samples.CRASH:
        return "crash";
      case Enums.Samples.KICK:
        return "kick";
      case Enums.Samples.TOM:
        return "rack_tom";
      case Enums.Samples.SNARE:
        return "snare";
      default:
        throw index;
    }
  }

  _getSampleText(index) {
    const me = this;
    switch (index) {
      case Enums.Samples.CRASH:
        return "attack";
      case Enums.Samples.KICK:
        return "walk";
      case Enums.Samples.TOM:
        return "turn";
      case Enums.Samples.SNARE:
        return "shield";
      default:
        throw index;
    }
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
