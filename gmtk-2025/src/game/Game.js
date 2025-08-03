import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import DrumKit from "./DrumKit.js";
import Enums from "./Enums.js";
import LevelConfig from "./LevelConfig.js";
import PanelControl from "./PanelControl.js";
import World from "./World.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {DrumKit} */
  _drumKit;

  /** @type {World} */
  _world;

  /** @type {Boolean} */
  _isWindowActive;

  /** @type {Number} */
  _gameTimer;

  /** @type {Number} */
  _currentLevelIndex = 0;

  /** @type {Number} */
  _gameState = Config.StartState;

  /** @type {PanelControl} */
  _panelControl;

  _hintCount = Config.StartHintCount;

  constructor() {
    const me = this;

    Here._.input.mouse.disableContextMenu();

    const sceneCamera = Here._.cameras.main;
    sceneCamera
      .setBackgroundColor("#9084A5")
      .setSize(
        Consts.Viewport.Width,
        Consts.Viewport.Height - Consts.DrumKit.ViewHeight
      );

    const levelConfig = Utils.firstOrNull(
      Config.Levels,
      (c) => c.name == Config.LevelOrder[me._currentLevelIndex]
    );

    if (!levelConfig) throw "error";

    me._drumKit = new DrumKit(levelConfig);
    me._world = new World(me);
    me._panelControl = new PanelControl(me);

    me._drumKit._camera.ignore(me._world._fade);
    sceneCamera.ignore(me._drumKit._fade);

    me._gameTimer = 0;

    Here._.input.on(
      "pointerdown",
      (pointer) => {
        me._onLMBClick(pointer);
      },
      me
    );

    me._isWindowActive = true;
    window.addEventListener("focus", () => {
      me._isWindowActive = true;
    });

    window.addEventListener("blur", () => {
      me._isWindowActive = false;
    });

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 10, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);

      me._drumKit._camera.ignore(me._log);
    });

    me.startGame();
  }

  processDragonTailClick() {
    const me = this;

    me._hintCount += 1;
    me._panelControl.updateHintCount();
  }

  update(time, delta) {
    const me = this;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    ) {
      Here._.scene.restart({ isRestart: true });
    }

    me._gameLoop(time, delta);

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;

      const tileX = Math.floor(mouse.worldX / Consts.Unit.Normal);
      const tileY = Math.floor(mouse.worldY / Consts.Unit.Normal);

      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `tle: ${tileX} ${tileY}\n` +
        `tme: ${(me._gameTimer / 1000) | 0} sec\n` +
        `ste: ${me._gameState}`;

      me._log.setText(text);
    });
  }

  _gameLoop(time, delta) {
    const me = this;

    if (me._gameState == Enums.GameStates.DONT_DO_ANYTHING) return;

    me._gameTimer += delta;

    const overallBit = Math.floor(me._gameTimer * Consts.BitPerMs);
    const currentBit = overallBit % me._drumKit.loopLength;

    const isNewBit = currentBit != me._drumKit._currentBit;
    const commands = me._drumKit.update(currentBit, me._isWindowActive, me);

    if (!!me.one_more_tail && me.one_more_tail.visible && !!commands) {
      const isHitttttt = commands[Enums.SampleCommands.SHIELD];
      const yyyyyyy = isHitttttt ? 350 : 300;
      me.one_more_tail.setPosition(me.one_more_tail.x, yyyyyyy);
      me._world.player._sprite.setFrame(isHitttttt ? 1 : 0);
    }

    if (!!me.one_more_tail && me.one_more_tail.visible) return;

    const bitResult = me._world.update(
      commands,
      currentBit,
      me._gameState,
      isNewBit,
      time
    );

    if (me._gameState == Enums.GameStates.BUSY) {
      if (
        !me._world.completeLevelTransition ||
        !me._drumKit.completeLevelTransition
      )
        return;

      if (me._drumKit._currentLevelConfig.name == "final") {
        return me._runGameOver();
      }

      me._gameState = Enums.GameStates.EDIT;
      me._world.runWithNextLoop();
      me._panelControl._applyState();
    }

    if (bitResult == Enums.BitResult.WIN) {
      me._gotoNextLevel(time);
    } else if (bitResult == Enums.BitResult.DEATH) {
      me._gameState = Enums.GameStates.EDIT;
      me._drumKit.showDeathIcon(currentBit);
      me._panelControl._applyState();
    }
  }

  _gotoNextLevel(time) {
    const me = this;

    me._currentLevelIndex =
      (me._currentLevelIndex + 1) % Config.LevelOrder.length;

    const levelConfig = Utils.firstOrNull(
      Config.Levels,
      (c) => c.name == Config.LevelOrder[me._currentLevelIndex]
    );

    if (!levelConfig) throw "error";

    me._gameState = Enums.GameStates.BUSY;

    if (levelConfig.name == "walk_tutorial") {
      me._drumKit._infoImage.setVisible(true);
      me._drumKit._indicator.setVisible(true);
      me._drumKit._selection.setAlpha(1);
      me._panelControl._container.setVisible(true);

      for (let i = 0; i < 4; ++i)
        for (let j = 0; j < 16; ++j) me._drumKit._loop[i][j] = false;
    }

    me._world.gotoNextLevel(levelConfig, time);
    me._drumKit.gotoNextLevel(levelConfig);
  }

  _onLMBClick(pointer) {
    const me = this;

    if (me.finalfinalfinalflag) {
      return me.aaaaaaaaaaaaaaaaaaaaaa();
    }

    if (
      me._gameState == Enums.GameStates.DONT_DO_ANYTHING &&
      me._drumKit._currentLevelConfig.name == "intro"
    )
      return me.startIntro();

    const pos = Utils.buildPoint(pointer.worldX, pointer.worldY);
    const isDrumKitClick = me._drumKit.onPointerDown(pos.x, pos.y);
    if (me._gameState == Enums.GameStates.PLAY && isDrumKitClick) {
      me._world.resetCurrentLevel();
      me._gameState = Enums.GameStates.EDIT;
      me._panelControl.toEditMode();
    }
    // if (me._gameState == Enums.GameStates.PLAY) {
    //   // play state
    //   if (me._drumKit.isInsideView(pos)) {
    //     me._world.resetCurrentLevel();
    //     me._gameState = Enums.GameStates.EDIT;
    //   }
    //   me._drumKit.onPointerDown(pos.x, pos.y);
    // } else if (me._gameState == Enums.GameStates.EDIT) {
    //   // edit state
    //   if (me._world.isInsideView(pos)) {
    //     me._world.runWithNextLoop();
    //     me._gameState = Enums.GameStates.PLAY;
    //   } else me._drumKit.onPointerDown(pos.x, pos.y);
    // }
  }

  toggleGameState() {
    const me = this;

    if (me._gameState == Enums.GameStates.BUSY) return true;

    if (me._gameState == Enums.GameStates.PLAY) {
      me._world.resetCurrentLevel();
      me._gameState = Enums.GameStates.EDIT;
    } else if (me._gameState == Enums.GameStates.EDIT) {
      me._world.runWithNextLoop();
      me._gameState = Enums.GameStates.PLAY;
    }

    return true;
  }

  processHintButtonClick() {
    const me = this;

    if (me._hintCount == 0) return;

    if (me._drumKit.showHint()) {
      me._hintCount -= 1;
      me._panelControl.updateHintCount(true);
    }
  }

  _runGameOver() {
    const me = this;

    me._gameState = Enums.GameStates.DONT_DO_ANYTHING;

    me._drumKit._fade.setVisible(true).setAlpha(1);
    me._panelControl._container.setVisible(false);

    const startPosX = me._world._currentLevelTileX * Consts.Unit.Normal;
    const head = Here._.add
      .image(startPosX + 800, 700, "dragon_head")
      .setFlipX(true);
    Here._.tweens.add({
      targets: head,
      y: 350,
      duration: 4000,
      ease: "sine.out",
      onComplete: () => {
        me._world._dragonTextPointer
          .setPosition(startPosX + 670, 350)
          .setAngle(30)
          .setVisible(true);

        me._world._dragonText
          .setText("Oh-oh...")
          .setPosition(startPosX + 600, 300)
          .setVisible(true);

        Here._.time.delayedCall(
          1000,
          () => {
            me._world._fade.setVisible(true).setAlpha(1);
            Here.Audio.play("final_final");

            Here._.time.delayedCall(
              5000,
              () => Here._.scene.restart({ isRestart: true }),
              me
            );
          },
          me
        );
      },
    });
  }

  startGame() {
    const me = this;

    if (me._drumKit._currentLevelConfig.name != "intro") return;

    me._gameState = Enums.GameStates.DONT_DO_ANYTHING;

    me.introScreen = Here._.add
      .image(0, 0, "intro_screen")
      .setOrigin(0, 0)
      .setScrollFactor(0, 0)
      .setDepth(Consts.Depth.Max);

    //====================

    me._drumKit._camera.ignore(me.introScreen);

    me._panelControl._container.setVisible(false);

    me._drumKit._indicator.setVisible(false);
    me._drumKit._infoImage.setVisible(false);

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 16; ++j) {
        me._drumKit._padButtons[i][j].setVisible(false);
      }
    }

    for (let j = 0; j < 16; ++j) me._drumKit._bitTextPool[j].setVisible(false);

    me._world._movePlayerPosTo({ x: 53, y: 8 }); //._container.setVisible(false);
    me._world._mainLevelContainer._finishFlag.setVisible(false);
    me._drumKit._selection.setAlpha(0);

    //======================

    Here._.add
      .image(700, 400, "dragon_head_bad")
      .setFlipX(true)
      .setScale(1.5)
      .setAngle(35);

    Here._.add.image(350, 200, "dragon_tail").setScale(1).setAngle(215);

    const textStyle = {
      fontFamily: "Arial Black",
      fontSize: 48,
      color: "#83a897",
    };

    Here._.add
      .text(
        1200,
        200,
        "Thank you for playing!\n\nCreated solo in 96 hours",
        textStyle
      )
      .setAlign("center");

    me.one_more_tail = Here._.add
      .image(2800, 350, "dragon_tail")
      .setScale(0.75);
  }

  startIntro() {
    const me = this;

    me._gameState = Enums.GameStates.EDIT;

    Here._.add.tween({
      targets: me.introScreen,
      alpha: { from: 1, to: 0 },
      duration: 50, //5000,
      onComplete: () => {
        // =================
        Here._.add.tween({
          targets: Here._.cameras.main,
          scrollX: 2000,
          duration: 1000, // TODO
          onComplete: () => {
            // ===================
            me._gameState = Enums.GameStates.EDIT;

            me._drumKit._logo.setVisible(true).setAlpha(0);

            Here._.add.tween({
              targets: me._drumKit._logo,
              alpha: { from: 0, to: 1 },
              duration: 1000,
              onComplete: () => {
                //===============

                const textStyle = {
                  fontFamily: "Arial Black",
                  fontSize: 48,
                  color: "#83a897",
                };

                me._lastText = Here._.add
                  .text(-4900, 100, "Click anywhere\nto start", textStyle)
                  .setAlign("center");

                me.finalfinalfinalflag = true;
              },
            });
          },
        });
      },
    });
  }

  aaaaaaaaaaaaaaaaaaaaaa() {
    const me = this;

    this.finalfinalfinalflag = false;
    if (!!me._lastText) me._lastText.setVisible(false).destroy();

    me._gameState = Enums.GameStates.PLAY;
    me.one_more_tail.setVisible(false).destroy();
    me.one_more_tail = null;
  }

  finalfinalfinalflag = false;
}
