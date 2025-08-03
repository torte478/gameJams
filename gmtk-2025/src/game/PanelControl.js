import Here from "../framework/Here.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Game from "./Game.js";

export default class PanelControl {
  /** @type {Phaser.GameObjects.Image} */
  _playStopButton;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Game} */
  _game;

  /** @type {Phaser.GameObjects.Text} */
  _playStopText;

  /** @type {Phaser.GameObjects.Text} */
  _hintCountText;

  constructor(game) {
    const me = this;

    me._game = game;

    const panel = Here._.add.image(50, 0, "controlPanel");

    const textStyle = {
      color: "#022518",
      fontSize: 20,
      fontFamily: "Arial Black",
    };

    me._playStopButton = Here._.add
      .image(-40, 0, "control", 0)
      .setInteractive();

    me._playStopButton.input.hitArea.setTo(0, 0, 100, 50);

    me._playStopText = Here._.add
      .text(-20, 0, "TEST", textStyle)
      .setOrigin(0, 0.5);

    const hintButton = Here._.add.image(100, 0, "control", 2).setInteractive();

    me._container = Here._.add
      .container(100, 480, [
        panel,
        me._playStopButton,
        me._playStopText,
        hintButton,
        //me._hintCountText,
      ])
      .setDepth(Consts.Depth.PanelControl)
      .setScrollFactor(0);

    me._playStopButton.on("pointerover", () =>
      me._selectButton(me._playStopButton)
    );
    me._playStopButton.on("pointerout", () =>
      me._unselectButton(me._playStopButton)
    );
    me._playStopButton.on("pointerdown", () => me._onPlayStopPointerDown());

    me._applyState();
  }

  _applyState() {
    const me = this;

    const gameState = me._game._gameState;

    if (gameState == Enums.GameStates.EDIT) {
      me._game._world._fade.setVisible(true);
      me._game._drumKit._fade.setVisible(false);

      me._playStopText.text = "PLAY";
    } else if (gameState == Enums.GameStates.PLAY) {
      me._game._world._fade.setVisible(false);
      me._game._drumKit._fade.setVisible(true);

      me._playStopText.text = "EDIT";
    } else {
      throw "error";
    }
  }

  toObj() {
    const me = this;

    return me._container;
  }

  toEditMode() {
    const me = this;

    me._playStopButton.setFrame(0);
    me._applyState();
  }

  _onPlayStopPointerDown() {
    const me = this;

    me._playStopButton.setScale(0.5);
    me._playStopButton.isPlayingDamnAnimation = true;
    Here._.time.delayedCall(
      250,
      () => {
        me._playStopButton.setScale(1);
        me._playStopButton.isPlayingDamnAnimation = false;
        me._unselectButton(me._playStopButton);
      },
      me
    );

    if (!me._game.toggleGameState()) {
      throw "error";
    }

    me._applyState();

    if (me._game._gameState == Enums.GameStates.PLAY) {
      me._playStopButton.setFrame(1);
    } else if (me._game._gameState == Enums.GameStates.EDIT) {
      me._playStopButton.setFrame(0);
    } else {
      throw "error";
    }

    me._playStopButton.input.hitArea.setTo(0, 0, 100, 50);
  }

  /**
   * @param {Phaser.GameObjects.Image} button
   */
  _selectButton(button) {
    const me = this;

    button.setScale(1.5);
  }

  _unselectButton(button) {
    const me = this;

    if (!button.isPlayingDamnAnimation) button.setScale(1);
  }
}
