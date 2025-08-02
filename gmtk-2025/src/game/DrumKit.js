import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import LevelConfig from "./LevelConfig.js";

export default class DrumKit {
  /** @type {Phaser.Cameras.Scene2D.Camera} */
  _camera;

  /** @type {Phaser.GameObjects.Graphics} */
  _graphics;

  /** @type {Boolean[][]} */
  _loop;

  /** @type {Phaser.GameObjects.Image} */
  _indicator;

  /** @type {Number} */
  _currentBit = -1;

  /** @type {Number[]} */
  _resultBuffer;

  /** @type {Number} */
  loopLength = 8; // TODO ?

  /** @type {Phaser.GameObjects.Image} */
  _deathIcon;

  /**
   * @param {LevelConfig} levelConfig
   */
  constructor(levelConfig) {
    const me = this;
    me._camera = Here._.cameras.add(
      0,
      Consts.Viewport.Height - Consts.DrumKit.ViewHeight,
      Consts.Viewport.Width,
      Consts.DrumKit.ViewHeight
    );
    me._camera
      .setBackgroundColor("#84A591")
      .setScroll(Consts.DrumKit.ViewScrollX, 0);

    me._indicator = Here._.add.image(
      Consts.DrumKit.StartPosX,
      Consts.DrumKit.StartPosY - Consts.DrumKit.CellSize / 2,
      "indicator"
    );

    me._deathIcon = Here._.add
      .image(0, 0, "death_icon")
      .setDepth(Consts.Depth.OverOverlay)
      .setVisible(false);

    me._moveIndicatorToBit(0);

    me._resultBuffer = Utils.buildArray(4, false);

    me._loop = [];
    for (let i = 0; i < Consts.DrumKit.SampleCount; ++i) {
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

    for (let i = 0; i < Consts.DrumKit.SampleCount; ++i) {
      const posY = Consts.DrumKit.StartPosY + i * Consts.DrumKit.CellSize;
      const text = Here._.add.text(
        Consts.DrumKit.StartPosX - 60,
        posY,
        me._getSampleText(i)
      );

      for (let j = 0; j < me.loopLength; ++j) {
        me._drawCell(i, j);
      }
    }

    const bitTextPosY = Consts.DrumKit.StartPosY + 4 * Consts.DrumKit.CellSize;
    for (let j = 0; j < me.loopLength; ++j) {
      Here._.add.text(
        Consts.DrumKit.StartPosX + j * Consts.DrumKit.CellSize + 10,
        bitTextPosY + 5,
        `${j}`
      );
    }
  }

  reset() {
    const me = this;
    me._currentBit = -1;
  }

  update(bit, isWindowActive) {
    const me = this;

    if (bit == me._currentBit) return null;

    me._currentBit = bit;
    me._moveIndicatorToBit(bit);

    if (!Utils.isDebug(Config.Debug.DisableHihats) && isWindowActive) {
      Here.Audio.play("closed_hihat");
    }

    for (let i = 0; i < Consts.DrumKit.SampleCount; ++i) {
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
      (y - Consts.DrumKit.StartPosY) / Consts.DrumKit.CellSize
    );
    const j = Math.floor(
      (x - Consts.DrumKit.StartPosX) / Consts.DrumKit.CellSize
    );

    if (i < 0 || i >= Consts.DrumKit.SampleCount || j < 0 || j >= me.loopLength)
      return;

    // only one
    if (!me._loop[i][j]) {
      for (let k = 0; k < Consts.DrumKit.SampleCount; ++k) {
        me._loop[k][j] = false;
        me._drawCell(k, j);
      }
    }

    me._loop[i][j] = !me._loop[i][j];
    me._drawCell(i, j);
  }

  gotoNextLevel(nextLevelConfig) {
    const me = this;

    // TODO
  }

  isInsideView(pos) {
    const me = this;

    return (
      pos.x >= me._camera.scrollX &&
      pos.x <= me._camera.scrollX + me._camera.width &&
      pos.y >= me._camera.scrollY &&
      pos.y <= me._camera.scrollY + me._camera.height
    );
  }

  showDeathIcon(bit) {
    const me = this;

    const pos = me._cellToWorldPos(0, bit);

    me._deathIcon
      .setPosition(pos.x + Consts.DrumKit.CellSize / 2, pos.y - 10)
      .setVisible(true);
  }

  _drawCell(i, j) {
    const me = this;

    const pos = me._cellToWorldPos(i, j);

    if (me._loop[i][j]) {
      me._graphics.fillStyle(0x0000ff, 1);
      me._graphics.fillRect(
        pos.x,
        pos.y,
        Consts.DrumKit.CellSize,
        Consts.DrumKit.CellSize
      );
    } else {
      me._graphics.fillStyle(0x84a591, 1);
      me._graphics.fillRect(
        pos.x,
        pos.y,
        Consts.DrumKit.CellSize,
        Consts.DrumKit.CellSize
      );

      me._graphics.lineStyle(2, "#000000", 1);
      me._graphics.strokeRect(
        pos.x,
        pos.y,
        Consts.DrumKit.CellSize,
        Consts.DrumKit.CellSize
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
      pos.x + Consts.DrumKit.CellSize / 2,
      me._indicator.y
    );
  }

  _cellToWorldPos(i, j) {
    const me = this;

    return {
      x: Consts.DrumKit.StartPosX + j * Consts.DrumKit.CellSize,
      y: Consts.DrumKit.StartPosY + i * Consts.DrumKit.CellSize,
    };
  }
}
