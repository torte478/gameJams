import Utils from "./Utils.js";
import Here from "./Here.js";
import Config from "../game/Config.js";
import Game from "../game/Game.js";
import Enums from "../game/Enums.js";

export default class Audio {
  /** @type {Set} */
  _playing;

  /** @type {Number} */
  _lastEatPlaying = 0;

  constructor() {
    const me = this;

    me._playing = new Set();
  }

  /**
   * @param {String} sound
   * @param {Phaser.Types.Sound.SoundConfig} config
   */
  play(sound, config) {
    const me = this;

    // Utils.ifDebug(Config.Debug.PlaySound, () => {
    Here._.sound.play(sound, config ? config : null);
    // });
  }

  /**
   * @param {String} sound
   * @param {Phaser.Types.Sound.SoundConfig} config
   */
  playIfNotPlaying(sound, config) {
    const me = this;

    if (me._playing.has(sound)) return;

    me._playing.add(sound);
    me.play(sound, config);
  }

  playVibe() {
    const me = this;

    const radioSeek = me._radio.seek;
    me._radio.stop();
    me._vibe = Here._.sound.add("musicVibe");
    me._vibe.play();
    me._vibe.setSeek(radioSeek).setLoop(true);
  }

  playRadio() {
    const me = this;

    me._radio = Here._.sound.add("musicRadio");
    me._radio.play();
    me._radio.setLoop(true);

    // me.play("musicRadio", { loop: true });
  }

  playEat() {
    const me = this;

    if (Game.phaseId >= Enums.Phase.P5_THE_GAME) return;

    const now = new Date().getTime();
    if (now - me._lastEatPlaying < 1000) return;

    me.play("eat");
    me._lastEatPlaying = now;
  }

  /**
   * @param {String} sound
   */
  stop(sound) {
    const me = this;

    Here._.sound.stopByKey(sound);

    if (me._playing.has(sound)) me._playing.delete(sound);
  }

  /**
   */
  stopAll() {
    const me = this;

    Here._.sound.stopAll();
    me._playing.clear();
  }
}
