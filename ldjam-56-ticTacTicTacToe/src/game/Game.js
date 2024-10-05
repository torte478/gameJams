import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Grid from "./Grid.js";
import Chunk from "./Chunk.js";
import Ai from "./Ai.js";
import State from "./State.js";
import View from "./View.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Phaser.GameObjects.Image} */
  _phantom;

  /** @type {Phaser.GameObjects.Group} */
  _imagePool;

  /** @type {Boolean} */
  _isFirstFrame = true;

  /** @type {Ai} */
  _ai;

  /** @type {State} */
  _state;

  /** @type {View} */
  _view;

  constructor() {
    const me = this;

    Here._.cameras.main.setScroll(-200, -100);
    Here._.input.mouse.disableContextMenu();

    me._phantom = Here._.add
      .image(100, 100, "step", 1)
      .setDepth(Consts.Depth.UI)
      .setVisible(false)
      .setAlpha(0.5);

    me._imagePool = Here._.add.group();
    me._ai = new Ai(Config.Init.Difficulty);
    me._view = new View();
    const initChunk = new Chunk(0);
    me._state = new State(initChunk);

    if (Utils.isDebug(Config.Debug.Skip)) me._debugInit();

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
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `sde: ${me._state.side == 1 ? "X" : "O"}\n` +
        `lyr: ${me._state.layer}\n` +
        `pth: ${me._state.path}`;

      me._log.setText(text);
    });
  }

  _onMouseClick(pointer) {
    const me = this;

    if (me._state.side != Enums.Side.CROSS || !me._state.isInputEnabled) return;

    return pointer.rightButtonDown()
      ? me._onRightButtonClick()
      : me._onLeftButtonClick(pointer.worldX, pointer.worldY);
  }

  _onRightButtonClick() {
    const me = this;

    if (!me._state.chunk.parent) return;

    me._hidePhantom();

    me._state.isInputEnabled = false;
    me._goToLayerUp(me._onFullStepComplete, me);
  }

  _onLeftButtonClick(x, y) {
    const me = this;

    const chunk = me._state.chunk;

    const cell = Grid.posToCell(Utils.buildPoint(x, y));
    if (cell == -1 || (me._state.layer == 0 && !chunk.canMakeStep(cell)))
      return;

    me._hidePhantom();

    me._state.isInputEnabled = false;
    if (me._state.layer > 0)
      return me._goToLayerDown(cell, me._onFullStepComplete, me);

    me._state.isInputEnabled = false;
    me._makeStep(
      { path: me._state.path, cell: cell },
      Enums.Side.CROSS,
      () => me._doAiStep(),
      me
    );
  }

  _doAiStep() {
    const me = this;

    const aiStep = me._ai.calcStep(me._state.chunk, me._state.path);
    me._makeStep(aiStep, Enums.Side.NOUGHT, me._onFullStepComplete, me);
  }

  _makeStep(step, side, callback, scope) {
    const me = this;

    if (Utils.equalArrays(step.path, me._state.path)) {
      return me._makeLayer0Step(step.cell, side, callback, scope);
    }

    const onTransitionComplete = () =>
      me._makeStep(step, side, callback, scope);
    let correct = true;
    for (let i = 0; i < me._state.path.length; ++i)
      if (me._state.path[i] != step.path[i]) {
        correct = false;
        break;
      }

    if (!correct) me._goToLayerUp(onTransitionComplete, me);
    else
      me._goToLayerDown(step.path[me._state.layer], onTransitionComplete, me);
  }

  _goToLayerUp(callback, scope) {
    const me = this;
    const chunk = me._state.chunk;

    me._state.layer++;
    me._view.goToUp(
      chunk.parent,
      me._state.path[me._state.path.length - 1],
      () => {
        me._state.chunk = chunk.parent;
        const newPath = [];
        for (let i = 0; i < me._state.path.length - 1; ++i)
          newPath.push(me._state.path[i]);
        me._state.path = newPath;

        Utils.callCallback(callback, scope);
      },
      me
    );
  }

  _goToLayerDown(cell, callback, scope) {
    const me = this;
    const chunk = me._state.chunk;

    me._state.layer--;
    me._view.goToDown(
      chunk.getCell(cell),
      cell,
      () => {
        me._state.chunk = chunk.getCell(cell);
        me._state.path.push(cell);

        Utils.callCallback(callback, scope);
      },
      me
    );
  }

  _makeLayer0Step(cell, side, callback, scope) {
    const me = this;
    const chunk = me._state.chunk;

    chunk.makeStep(cell, side);
    me._view.makeStep(cell, side);
    me._state.side *= -1;

    me._tryUp(callback, scope);
  }

  _tryUp(callback, scope) {
    const me = this;
    const chunk = me._state.chunk;

    const winner = chunk.recalculateWinner();

    if (winner == Enums.Side.NONE) {
      return Utils.callCallback(callback, scope);
    }

    let parent = chunk.parent;
    if (!parent) {
      parent = new Chunk(me._state.layer + 1, me._imagePool);
      chunk.setParent(parent);
      const newPath = [Enums.Cells.C];
      for (let i = 0; i < me._state.path.length; ++i)
        newPath.push(me._state.path[i]);
      me._state.path = newPath;
    }

    const parentCell = me._state.path[me._state.path.length - 1];
    me._goToLayerUp(() => {
      parent.makeStep(parentCell, chunk);
      me._tryUp(callback, scope);
    }, me);
  }

  _gameLoop() {
    const me = this;

    if (!me._state.isInputEnabled) return;

    const mouse = Here._.input.activePointer;
    const worldPos = Utils.buildPoint(mouse.worldX, mouse.worldY);
    const cell = Grid.posToCell(worldPos);

    if (me._isFirstFrame) {
      if (worldPos.x != 0 || worldPos.y != 0) me._isFirstFrame = false;
    } else me._showPhantom(cell);
  }

  _showPhantom(cell) {
    const me = this;

    if (cell == -1 || !me._state.isInputEnabled) return me._hidePhantom();

    const pos = Grid.cellToPos(cell);
    if (me._state.layer == 0) {
      if (!me._state.chunk.canMakeStep(cell))
        return me._phantom.setVisible(false);

      return me._phantom.setVisible(true).setPosition(pos.x, pos.y);
    }

    return me._view.showPhantom(me._state.chunk, cell);
  }

  _hidePhantom() {
    const me = this;

    me._phantom.setVisible(false);
    if (me._state.layer > 0) me._view.resetChildView(me._state.chunk);
  }

  _onFullStepComplete() {
    const me = this;

    if (me._state.layer > 0) me._view.resetChildView(me._state.chunk);

    me._state.isInputEnabled = true;
  }

  _debugInit() {
    const me = this;

    if (Config.Init.Skip == 0) return;

    if (Config.Init.Skip == 1) {
      const chunk = new Chunk(0);
      chunk.makeStep(Enums.Cells.LU, Enums.Side.NOUGHT);
      chunk.makeStep(Enums.Cells.U, Enums.Side.NOUGHT);
      chunk.makeStep(Enums.Cells.LD, Enums.Side.CROSS);
      chunk.makeStep(Enums.Cells.D, Enums.Side.CROSS);
      me._view._first.setState(chunk.getState());
      me._state.chunk = chunk;
    }

    if (Config.Init.Skip == 2) {
      const me = this;

      const chunks = [new Chunk(0), new Chunk(0), new Chunk(0)];
      const parent = new Chunk(1);
      for (let i = 0; i < chunks.length; ++i) {
        const chunk = chunks[i];
        chunk.makeStep(Enums.Cells.LU, Enums.Side.NOUGHT);
        chunk.makeStep(Enums.Cells.U, Enums.Side.NOUGHT);
        if (i < 2) chunk.makeStep(Enums.Cells.RU, Enums.Side.NOUGHT);
        chunk.setParent(parent);
        parent.makeStep(i, chunk);
      }

      me._state.path = [2];
      const res = chunks[2];
      me._view._first.setState(res.getState());
      me._state.chunk = res;
    }
  }
}
