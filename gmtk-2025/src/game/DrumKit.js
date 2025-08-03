import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import LevelConfig from "./LevelConfig.js";
import LevelObject from "./LevelObject.js";

export default class DrumKit {
  /** @type {Phaser.Cameras.Scene2D.Camera} */
  _camera;

  /** @type {Boolean[][]} */
  _loop;

  /** @type {Phaser.GameObjects.Image} */
  _indicator;

  /** @type {Number} */
  _currentBit = -1;

  /** @type {Number[]} */
  _resultBuffer;

  /** @type {Number} */
  loopLength;

  /** @type {Phaser.GameObjects.Image} */
  _deathIcon;

  /** @type {Boolean} */
  completeLevelTransition = true;

  /** @type {Phaser.GameObjects.Text[]} */
  _bitTextPool;

  /** @type {Phaser.GameObjects.Image[][]} */
  _padButtons;

  /** @type {Phaser.GameObjects.Image} */
  _infoImage;

  /** @type {Phaser.GameObjects.Image} */
  _selection;

  /** @type {Number[]} */
  _availableSamples;

  /** @type {Phaser.GameObjects.Image} */
  _logo;

  /** @type {Phaser.GameObjects.Image} */
  _fade;

  _hintArray;

  _currentHintIndex = 0;

  /** @type {LevelConfig} */
  _currentLevelConfig;

  /**
   * @param {LevelConfig} levelConfig
   */
  constructor(levelConfig) {
    const me = this;
    me._currentLevelConfig = levelConfig;
    me._camera = Here._.cameras.add(
      0,
      Consts.Viewport.Height - Consts.DrumKit.ViewHeight,
      Consts.Viewport.Width,
      Consts.DrumKit.ViewHeight
    );
    me._camera
      .setBackgroundColor("#021e14")
      .setScroll(Consts.DrumKit.ViewScrollX, 0);

    me._indicator = Here._.add.image(
      Consts.DrumKit.StartPosX,
      Consts.DrumKit.StartPosY - Consts.DrumKit.CellSize / 2,
      "indicator"
    );

    me._logo = Here._.add.image(-4200, 150, "logo");

    me._fade = Here._.add
      .image(0, 0, "fade")
      .setAlpha(0.25)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(Consts.Depth.Fade);

    me._deathIcon = Here._.add
      .image(0, 0, "death_icon")
      .setDepth(Consts.Depth.Overlay)
      .setVisible(false);

    me._moveIndicatorToBit(0);

    me._resultBuffer = Utils.buildArray(4, false);

    me._infoImage = Here._.add.image(-4900, 140, "info");

    me._selection = Here._.add
      .image(0, 0, "selection")
      .setVisible(false)
      .setDepth(Consts.Depth.OverOverlay);

    me._loop = [];
    for (let i = 0; i < Consts.DrumKit.SampleCount; ++i) {
      const line = Utils.buildArray(Consts.DrumKit.MaxBitCount, false);
      me._loop.push(line);
    }

    me._hintArray = Utils.buildArray(Consts.DrumKit.MaxBitCount, false);

    // bit text
    me._bitTextPool = [];
    /** @type {Phaser.Types.GameObjects.Text.TextStyle} */
    const bitTextStyle = {
      color: "#83a897",
      fontSize: 25,
      fontFamily: "Arial Black",
    };
    const bitTextPosY = Consts.DrumKit.StartPosY + 4 * Consts.DrumKit.CellSize;
    for (let i = 0; i < Consts.DrumKit.MaxBitCount; ++i) {
      const bitIndexToShow = Utils.isDebug(Config.Debug.Global) ? i : i + 1;
      const bitText = Here._.add
        .text(
          Consts.DrumKit.StartPosX + i * Consts.DrumKit.CellSize + 25,
          bitTextPosY + 15,
          bitIndexToShow,
          bitTextStyle
        )
        .setOrigin(0.5)
        .setVisible(false);

      me._bitTextPool.push(bitText);
    }

    // buttons
    me._padButtons = [];
    for (let i = 0; i < Consts.DrumKit.SampleCount; ++i) {
      const row = [];
      for (let j = 0; j < Consts.DrumKit.MaxBitCount; ++j) {
        const pos = me._cellToWorldPos(i, j);
        const button = Here._.add.image(
          pos.x + 0.5 * Consts.Unit.Normal,
          pos.y + 0.5 * Consts.Unit.Normal,
          "pads",
          0
        );
        row.push(button);
      }
      me._padButtons.push(row);
    }

    me._initAllCells(levelConfig);

    // solution
    if (Utils.isDebug(Config.Debug.StartFromSolution)) {
      const solution = levelConfig.solution;
      for (let i = 0; i < solution.length; ++i)
        for (let j = 0; j < solution[i].length; ++j) {
          me._loop[i][j] = !!solution[i][j];

          if (me._loop[i][j]) me._toggleCell(i, j);
        }
    }
  }

  /**
   * @param {LevelConfig} levelConfig
   */
  _initAllCells(levelConfig) {
    const me = this;

    me.loopLength = !!levelConfig.length
      ? levelConfig.length
      : Consts.DrumKit.DefaultBitLength;

    me._availableSamples = !!levelConfig.availableCommands
      ? levelConfig.availableCommands
      : [0, 1, 2, 3];

    for (let i = 0; i < Consts.DrumKit.MaxBitCount; ++i) {
      me._bitTextPool[i].setVisible(i < me.loopLength);
    }

    for (let i = 0; i < Consts.DrumKit.SampleCount; ++i) {
      const isAvaibleSample = me._isAvaiableSample(i);
      for (let j = 0; j < Consts.DrumKit.MaxBitCount; ++j) {
        me._padButtons[i][j]
          .setVisible(j < me.loopLength)
          .setAlpha(isAvaibleSample ? 1 : 0.25);
        if (!isAvaibleSample) me._padButtons[i][j].setFrame(10);
      }
    }
  }

  reset() {
    const me = this;
    me._currentBit = -1;
  }

  update(bit, isWindowActive) {
    const me = this;

    const pointer = Here._.input.activePointer;
    const cell = me._tryGetCellFromWorldPos(pointer.worldX, pointer.worldY);
    if (!!cell) {
      const pos = me._cellToWorldPos(cell.i, cell.j);
      me._selection
        .setVisible(true)
        .setPosition(
          pos.x + 0.5 * Consts.Unit.Normal,
          pos.y + 0.5 * Consts.Unit.Normal
        );
    } else {
      me._selection.setVisible(false);
    }

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

    const cell = me._tryGetCellFromWorldPos(x, y);
    if (!cell) return false;

    // only one (ignore crash)
    if (!me._loop[cell.i][cell.j] && cell.i > 0) {
      for (let k = 1; k < Consts.DrumKit.SampleCount; ++k) {
        me._loop[k][cell.j] = false;
        me._toggleCell(k, cell.j);
      }
    }

    me._loop[cell.i][cell.j] = !me._loop[cell.i][cell.j];
    me._toggleCell(cell.i, cell.j);

    return true;
  }

  _tryGetCellFromWorldPos(x, y) {
    const me = this;

    const i = Math.floor(
      (y - Consts.DrumKit.StartPosY) / Consts.DrumKit.CellSize
    );
    const j = Math.floor(
      (x - Consts.DrumKit.StartPosX) / Consts.DrumKit.CellSize
    );

    if (i < 0 || i >= Consts.DrumKit.SampleCount || j < 0 || j >= me.loopLength)
      return null;

    if (!me._isAvaiableSample(i)) return null;

    return { i: i, j: j };
  }

  showHint() {
    const me = this;

    let isAllHints = true;
    for (let i = 0; i < me.loopLength; ++i)
      if (!me._hintArray[i]) {
        isAllHints = false;
        break;
      }

    if (isAllHints) return false;

    const j = me._currentHintIndex;

    me._hintArray[j] = true;
    for (let i = 0; i < 4; ++i) {
      if (!me._isAvaiableSample(i)) continue;

      let frame = -1;
      if (me._loop[i][j]) {
        frame = me._getFrame(i);
      } else {
        frame = 0;
      }

      const offset = me._currentLevelConfig.solution[i][j] ? 5 : 10;
      me._padButtons[i][j].setFrame(frame + offset);
    }

    me._currentHintIndex = me._currentHintIndex + 4;
    if (me._currentHintIndex >= me.loopLength)
      me._currentHintIndex = (me._currentHintIndex % me.loopLength) + 1;

    return true;
  }

  gotoNextLevel(nextLevelConfig) {
    const me = this;

    me.completeLevelTransition = false;

    for (let i = 0; i < me._hintArray.length; ++i) me._hintArray[i] = false;
    me._currentHintIndex = 0;

    me._deathIcon.setVisible(false);
    me._initAllCells(nextLevelConfig);

    me.completeLevelTransition = true;
    me._currentLevelConfig = nextLevelConfig;
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

  _getFrame(sample) {
    const me = this;

    if (sample == Enums.Samples.CRASH) return 4;
    else if (sample == Enums.Samples.KICK) return 3;
    else if (sample == Enums.Samples.SNARE) return 2;
    else if (sample == Enums.Samples.TOM) return 1;
    else throw "error";
  }

  _toggleCell(i, j) {
    const me = this;

    const button = me._padButtons[i][j];

    let offset = 0;
    if (me._hintArray[j]) {
      offset = me._currentLevelConfig.solution[i][j] ? 5 : 10;
    }

    if (me._loop[i][j]) {
      const frame = me._getFrame(i);
      button.setFrame(frame + offset);
    } else {
      // disable
      const frame = me._isAvaiableSample(i) ? 0 + offset : 10;
      button.setFrame(frame);
    }
  }

  _isAvaiableSample(sample) {
    const me = this;

    return Utils.any(me._availableSamples, (s) => s === sample);
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
