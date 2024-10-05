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
    const initChunk = new Chunk(0, me._imagePool);
    me._state = new State(initChunk);
    me._ai = new Ai(Config.Init.Difficulty);
    me._view = new View();

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
    throw "not implemented";
  }

  _onLeftButtonClick(x, y) {
    const me = this;

    const chunk = me._state.chunk;

    const cell = Grid.posToCell(Utils.buildPoint(x, y));
    if (cell == -1 || !chunk.isFree(cell)) return;

    me._hidePhantom();

    if (me._state.layer == 0) {
      const result = me._makeStep({ path: [], cell: cell }, Enums.Side.CROSS);

      const aiStep = me._ai.calcStep(chunk);
      me._makeStep(aiStep, Enums.Side.NOUGHT);
    } else throw "not implemented";

    // if (result == Enums.Side.CROSS || result == Enums.Side.DRAW) {
    //     me._toNextLayer();
    // } else {
    //     const aiStep = me._ai.makeStep(chunk);
    //     me._makeStep(aiStep, Enums.Side.NOUGHT);
    // }
  }

  _makeStep(step, side) {
    const me = this;

    if (Utils.equalArrays(step.path, me._state.path)) {
      return me._makeLayer0Step(step.cell, side);
    }

    if (me._state.path.length > 0)
      me._goToLayerUp(() => me._makeStep(step, side), me);
    else me._goToLayerDown(step.path[0], () => me._makeStep(step, side), me);

    // if (me._state.path.length == 0 && step.path.length > 0)
    //     return me._goToLayer(me._state.layer - 1, () => me._makeStep(step, side), me);
    // me._goToLayer(me._state.layer + 1, () => me._makeStep(step, side), me);

    // if (me._state.layer > 0else {
    //   me._showLayer(me._state.layer + 1, () => me._makeStep(step, side), me);
    // }

    // let chunk = me._state.chunk.getRoot();
    // for (let i = 0; i < step.length - 1; ++i) {
    //   chunk = chunk.getCell(step[i]);
    // }
  }

  _goToLayerUp(callback, scope) {
    const me = this;
    const chunk = me._state.chunk;

    me._state.isInputEnabled = false;

    me._state.layer++;
    me._view.goToUp(
      chunk.parent.getState(),
      () => {
        me._state.chunk = chunk.parent;
        const newPath = [];
        for (let i = 0; i < me._state.path.length - 1; ++i)
          newPath.push(me._state.path[i]);
        me._state.path = newPath;

        Utils.callCallback(callback, scope);

        me._state.isInputEnabled = true;
      },
      me
    );
  }

  _goToLayerDown(cell, callback, scope) {
    const me = this;
    const chunk = me._state.chunk;

    me._state.isInputEnabled = false;

    me._state.layer--;
    me._view.goToDown(
      chunk.getCell(cell).getState(),
      cell,
      () => {
        me._state.chunk = chunk.getCell(cell);
        me._state.path.push(cell);

        Utils.callCallback(callback, scope);

        me._state.isInputEnabled = true;
      },
      me
    );
  }

  _makeLayer0Step(cell, side) {
    const me = this;
    const chunk = me._state.chunk;

    const winner = chunk.makeStep(cell, side);
    me._view.makeStep(cell, side);
    me._state.side *= -1;

    if (winner == Enums.Side.NONE) return winner;

    if (!chunk.parent) {
      const parent = new Chunk(me._state.layer + 1, me._imagePool);
      chunk.setParent(parent);
      parent.makeStep(Enums.Cells.C, chunk);

      const newPath = [Enums.Cells.C];
      for (let i = 0; i < me._state.path.length; ++i)
        newPath.push(me._state.path[i]);
      me._state.path = newPath;
    }

    return winner;
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

    if (cell == -1) return me._phantom.setVisible(false);

    const pos = Grid.cellToPos(cell);
    if (me._state.layer == 0) {
      if (!me._state.chunk.isFree(cell)) return me._phantom.setVisible(false);

      return me._phantom.setVisible(true).setPosition(pos.x, pos.y);
    }

    const childState = me._state.chunk.getChildState(cell);
    return me._view.showPhantom(cell, me._state.chunk.getState(), childState);
  }

  _hidePhantom() {
    const me = this;

    me._phantom.setVisible(false);
    me._view.hidePhantom(me._state.chunk.getState());
  }
}
