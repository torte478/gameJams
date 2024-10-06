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
import Level1 from "./Levels/Level1.js";
import Level2 from "./Levels/Level2.js";
import Level3 from "./Levels/Level3.js";
import Level4 from "./Levels/Level4.js";

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

  _maxLayer = 0;

  _bonusCounter = 0 + Config.Init.BonusCount;
  _maxBonusCount = 0;

  _hp = Config.Boss.MaxHP;

  constructor() {
    const me = this;

    Here._.cameras.main.setScroll(-200, -100);
    Here._.input.mouse.disableContextMenu();

    Here._.physics.world.setBounds(
      -200,
      -100,
      Consts.Viewport.Width,
      Consts.Viewport.Height
    );

    me._phantom = Here._.add
      .image(100, 100, "step", 1)
      .setDepth(Consts.Depth.UI)
      .setVisible(false)
      .setAlpha(0.5)
      .setTintFill(Config.Colors[0].main);

    me._imagePool = Here._.add.group();
    me._ai = new Ai(Config.Init.Difficulty);
    me._view = new View(Config.Colors[0]);
    const initChunk = new Chunk(0);
    me._state = new State(initChunk);

    for (let i = 0; i < Config.Bonuses.segments.length; ++i) {
      me._maxBonusCount += Config.Bonuses.segments[i];
    }

    me._view.drawBonusCount(me._bonusCounter);

    me._level1Stuff = new Level1();
    me._level2Stuff = new Level2();
    me._level3Stuff = new Level3();
    me._level4Stuff = new Level4();

    me._view.drawHp(me._hp);

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
        `hp: ${me._hp}\n` +
        `bns: ${me._bonusCounter}`;

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

    if (me._state.bonusState == Enums.BonusState.NONE) {
      const bonus = me._view.tryClickBonus(
        me._bonusCounter,
        Utils.buildPoint(x, y)
      );
      if (!!bonus) {
        return me._onBonusClick(bonus);
      }
    }

    const cell = Grid.posToCell(Utils.buildPoint(x, y));
    if (!me._canMakeStep(chunk, cell)) return;

    me._hidePhantom();

    me._state.isInputEnabled = false;
    if (me._state.layer > 0)
      return me._goToLayerDown(cell, me._onFullStepComplete, me);

    me._makeStep(
      { path: me._state.path, cell: cell },
      Enums.Side.CROSS,
      () => {
        if (me._hp == 0) return me._gameOver();

        if (me._state.bonusState != Enums.BonusState.DOUBLE_CLICK) {
          me._doAiStep();
        } else {
          me._state.bonusState = Enums.BonusState.NONE;
          me._view._hintText.setVisible(false);
          me._state.isInputEnabled = true;
        }
      },
      me
    );
  }

  _canMakeStep(chunk, cell) {
    const me = this;

    if (cell == -1) return false;

    if (me._state.layer > 0) return true;

    // layer == 0

    if (me._state.bonusState == Enums.BonusState.SWAP) {
      if (chunk.getCell(cell) == Enums.Side.NOUGHT) return true;
      else return false;
    }

    if (me._state.bonusState == Enums.BonusState.SUPER_X) {
      return true;
    }

    if (chunk.canMakeStep(cell)) return true;

    return false;
  }

  _onBonusClick(bonusIndex) {
    const me = this;

    me._state.bonusState = bonusIndex;
    let cost = 0;
    for (let i = 0; i < bonusIndex; ++i) cost += Config.Bonuses.segments[i];

    me._bonusCounter = Math.max(0, me._bonusCounter - cost);
    me._view.drawBonusCount(me._bonusCounter);
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

    let canGoDown = true;
    for (let i = 0; i < me._state.path.length; ++i)
      if (me._state.path[i] != step.path[i]) {
        canGoDown = false;
        break;
      }

    if (canGoDown) {
      me._goToLayerDown(
        step.path[step.path.length - me._state.layer],
        () => {
          const duration = me._state.layer > 0 ? Config.Duration.Between : 0;
          Here._.time.delayedCall(duration, onTransitionComplete, me);
        },
        me
      );
    } else {
      me._goToLayerUp(onTransitionComplete, me);
    }
  }

  _goToLayerUp(callback, scope) {
    const me = this;
    const chunk = me._state.chunk;

    me._level1Stuff.stop();
    me._level2Stuff.stop();
    me._level3Stuff.stop();
    me._level4Stuff.stop();

    me._state.layer++;
    me._view.goToUp(
      chunk.parent,
      me._state.path[me._state.path.length - 1],
      me._maxLayer + 1,
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

    me._level1Stuff.stop();
    me._level2Stuff.stop();
    me._level3Stuff.stop();
    me._level4Stuff.stop();

    me._state.layer--;
    me._view.goToDown(
      chunk.getCell(cell),
      cell,
      me._maxLayer + 1,
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

    const force =
      me._state.bonusState == Enums.BonusState.SWAP ||
      me._state.bonusState == Enums.BonusState.SUPER_X;
    let winner = -1;
    if (me._state.bonusState == Enums.BonusState.SUPER_X) {
      for (let i = 0; i < 9; ++i) winner = chunk.makeStep(i, side, force);
    } else {
      winner = chunk.makeStep(cell, side, force);
    }
    if (
      me._state.bonusState == Enums.BonusState.SWAP ||
      me._state.bonusState == Enums.BonusState.SUPER_X
    ) {
      me._view._hintText.setVisible(false);
      me._state.bonusState = Enums.BonusState.NONE;
    }

    me._view.makeStep(cell, side);
    if (winner != Enums.Side.NONE) me._view._first.setState(chunk.getState());

    if (me._state.bonusState != Enums.BonusState.DOUBLE_CLICK)
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

    me._updateBonusCounter(winner);

    let parent = chunk.parent;
    if (!parent) {
      parent = new Chunk(me._state.layer + 1, me._imagePool);
      chunk.setParent(parent);
      const newPath = [Enums.Cells.C];
      for (let i = 0; i < me._state.path.length; ++i)
        newPath.push(me._state.path[i]);
      me._state.path = newPath;
      me._onNewLayer(me._state.layer + 1);
    }

    Here._.time.delayedCall(
      Config.Duration.Between,
      () => {
        const parentCell = me._state.path[me._state.path.length - 1];
        me._goToLayerUp(() => {
          parent.makeStep(parentCell, chunk);
          me._view.makeStep(parentCell, winner);
          Here._.time.delayedCall(
            Config.Duration.Between,
            () => me._tryUp(callback, scope),
            me
          );
        }, me);
      },
      me
    );
  }

  _onNewLayer(newLayer) {
    const me = this;

    ++me._maxLayer;
    me._view.drawMapSegment(newLayer);

    if (newLayer == 1) {
      me._view._hintText.setText("RIGHT CLICK TO GO BACK").setVisible(true);
      me._view.showMap();
    }
    if (newLayer == 2) {
      me._view.showBonuses();
    }
  }

  _gameLoop() {
    const me = this;

    if (!me._state.isInputEnabled) return;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.CANCEL) &&
      me._state.bonusState != Enums.BonusState.NONE
    ) {
      me._state.bonusState = Enums.BonusState.NONE;
      me._view._hintText.setVisible(false);
      return;
    }

    const mouse = Here._.input.activePointer;
    const worldPos = Utils.buildPoint(mouse.worldX, mouse.worldY);

    if (me._state.bonusState == Enums.BonusState.NONE) {
      me._view.updateBonusText(me._bonusCounter, worldPos);
    }

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
      if (!me._canMakeStep(me._state.chunk, cell))
        return me._phantom.setVisible(false).setScale(1);

      if (me._state.bonusState == Enums.BonusState.SUPER_X) {
        return me._phantom.setVisible(true).setPosition(300, 300).setScale(3);
      }

      return me._phantom.setVisible(true).setPosition(pos.x, pos.y).setScale(1);
    }

    return me._view.showPhantom(me._state.chunk, cell);
  }

  _hidePhantom() {
    const me = this;

    me._phantom.setVisible(false).setScale(1);
    if (me._state.layer > 0) me._view.resetChildView(me._state.chunk);
  }

  _onFullStepComplete() {
    const me = this;

    if (me._state.layer > 0) me._view.resetChildView(me._state.chunk);

    if (me._state.layer == 1) me._level1Stuff.start();
    if (me._state.layer == 2) me._level2Stuff.start();
    if (me._state.layer == 3) me._level3Stuff.start();
    if (me._state.layer == 4) me._level4Stuff.start();

    me._state.isInputEnabled = true;
  }

  _updateBonusCounter(winner) {
    const me = this;

    // if (me._maxLayer < 2) return; // TODO

    if (me._maxLayer >= 0) {
      // TODO
      if (winner == Enums.Side.CROSS) me._hp -= 3;
      if (winner == Enums.Side.DRAW) me._hp -= 1;
      if (winner == Enums.Side.NOUGHT) me._hp += 3;

      me._hp = Math.min(Config.Boss.MaxHP, Math.max(0, me._hp));
      me._view.drawHp(me._hp);
    }

    if (winner == Enums.Side.NONE || winner == Enums.Side.NOUGHT) return;

    if (winner == Enums.Side.CROSS) me._bonusCounter += 3;
    if (winner == Enums.Side.DRAW) me._bonusCounter += 1;

    me._bonusCounter = Math.min(me._bonusCounter, me._maxBonusCount);

    me._view.drawBonusCount(me._bonusCounter);
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

  _gameOver() {
    const me = this;

    me._view._first.container.setVisible(false);
    me._view._second.container.setVisible(false);
    for (let i = 0; i < me._view._cells.length; ++i)
      me._view._cells[i].container.setVisible(false);
    me._view._hpContainer.setVisible(false);
    me._view._bonusesContainer.setVisible(false);
    me._view._mapGraphicsContainer.setVisible(false);
    me._view._hintText.setVisible(false);

    Utils.UpdateColor(
      me._view._background,
      1000,
      Config.Colors[me._state.layer].background,
      Config.Colors[4].background
    );

    const boss = Here._.add.image(300, 300, "boss").setAlpha(0);
    Here._.add.tween({
      targets: boss,
      alpha: { from: 0, to: 1 },
      duration: 200, //0,
      ease: "Sine.easeIn",
      onComplete: () => {
        const t1 = Here._.add.tween({
          targets: boss,
          x: { from: 300 + -50 * boss.scale, to: 300 + 50 * boss.scale },
          yoyo: true,
          duration: 100,
          repeat: -1,
        });

        Here._.add.tween({
          targets: boss,
          scale: { from: 1, to: 0.25 },
          alpha: { from: 1, to: 0.25 },
          duration: 100, //00,
          onComplete: () => {
            boss.setVisible(false);
            t1.stop();
            me._gameGameOver();
          },
        });
      },
    });
  }

  _gameGameOver() {
    const me = this;

    Here._.add
      .text(300, 200, "VICTORY!!!", { fontSize: 84, fontFamily: "Arial Black" })
      .setTintFill(Config.Colors[4].main)
      .setOrigin(0.5);

    Here._.add
      .text(300, 400, "TODO: fix this screen before jam ends", {
        fontSize: 24,
        fontFamily: "Arial",
      })
      .setTintFill(Config.Colors[4].main)
      .setOrigin(0.5);
  }
}
