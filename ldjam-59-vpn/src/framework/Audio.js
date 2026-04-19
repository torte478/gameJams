import Utils from "./Utils.js";
import Here from "./Here.js";
import Config from "../game/Config.js";

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

    Utils.ifDebug(Config.Debug.PlaySound, () => {
      Here._.sound.play(sound, config ? config : null);
    });
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

  playEat() {
    const me = this;

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
