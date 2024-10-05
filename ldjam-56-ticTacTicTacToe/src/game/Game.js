import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Grid from "./Grid.js";
import Controls from "../framework/Controls.js";
import Chunk from "./Chunk.js";
import Ai from "./Ai.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Phaser.GameObjects.Image} */
  _phantom;

  /** @type {Chunk} */
  _currentChunk;

  /** @type {Phaser.GameObjects.Group} */
  _stepPool;

  /** @type {Boolean} */
  _isFirstFrame = true;

  /** @type {Ai} */
  _ai;

  /** @type {Number} */
  _currentSide;

  constructor() {
    const me = this;

    Here._.cameras.main.setScroll(-200, -100);
    Here._.input.mouse.disableContextMenu();

    me._phantom = Here._.add
      .image(100, 100, "step", 0)
      .setVisible(false)
      .setAlpha(0.5);

    me._currentSide = Config.Init.Side;

    me._stepPool = Here._.add.group();
    me._currentChunk = new Chunk(me._stepPool);
    me._ai = new Ai(Config.Init.Difficulty);

    Here._.add.image(Consts.Sizes.Cell * 1.5, Consts.Sizes.Cell * 1.5, "grid");

    Here._.input.on("pointerdown", me._onMouseClick, me);

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 10, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);
    });
  }

  update() {
    const me = this;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    ) {
      Here._.scene.restart({ isRestart: true });
    }

    me._gameLoop();

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;
      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY.y | 0}\n` +
        `sde: ${me._currentSide}`;

      me._log.setText(text);
    });
  }

  _onMouseClick(pointer) {
    const me = this;

    if (me._currentSide != Enums.Side.CROSS) return;

    return pointer.rightButtonDown()
      ? me._onRightButtonClick()
      : me._onLeftButtonClick(pointer.worldX, pointer.worldY);
  }

  _onRightButtonClick() {
    const me = this;
    throw "not implemented";
  }

  _onLeftButtonClick(x, y) {
    const me = this;

    const cell = Grid.posToCell(Utils.buildPoint(x, y));
    if (cell == -1 || !me._currentChunk.isFree(cell)) return;

    me._currentChunk.makeStep(cell, Enums.Side.CROSS);
    const aiStep = me._ai.makeStep(me._currentChunk);
    me._currentChunk.makeStep(aiStep, Enums.Side.NOUGHT);
  }

  _gameLoop() {
    const me = this;

    if (me._isFirstFrame && me._currentSide == Enums.Side.NOUGHT) {
      const aiStep = me._ai.makeStep(me._currentChunk);
      me._currentChunk.makeStep(aiStep, Enums.Side.NOUGHT);
      me._nextSide();
      return;
    }

    const mouse = Here._.input.activePointer;
    const worldPos = Utils.buildPoint(mouse.worldX, mouse.worldY);
    const cell = Grid.posToCell(worldPos);

    if (me._isFirstFrame) {
      if (worldPos.x != 0 || worldPos.y != 0) me._isFirstFrame = false;
    } else me._showPhantom(cell);
  }

  _nextSide() {
    const me = this;

    me._currentSide *= -1;
  }

  _showPhantom(cell) {
    const me = this;

    if (cell == -1 || !me._currentChunk.isFree(cell)) {
      me._phantom.setVisible(false);
      return;
    }

    const pos = Grid.cellToPos(cell);
    me._phantom.setVisible(true).setPosition(pos.x, pos.y);
  }
}
