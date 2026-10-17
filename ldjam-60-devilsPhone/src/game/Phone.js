import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";

export default class Phone {
  constructor() {
    const me = this;

    const center = new Phaser.Math.Vector2(500, 550);

    me._background = Here._.add
      .image(center.x, center.y, "phoneBack")
      .setDepth(Consts.Depth.PhoneBack);
    me._front = Here._.add
      .image(center.x, center.y, "phoneFront")
      .setDepth(Consts.Depth.PhoneFront);
    me._limiter = Here._.add
      .image(center.x + 100, center.y + 150, "phoneLimiter")
      .setDepth(Consts.Depth.PhoneLimiter);

    const digitsPos = Utils.buildArray(10, null);
    digitsPos[0] = { x: +160, y: 0 };
    digitsPos[1] = { x: +130, y: -60 };
    digitsPos[2] = { x: +80, y: -120 };
    digitsPos[3] = { x: 0, y: -150 };
    digitsPos[4] = { x: -80, y: -120 };
    digitsPos[5] = { x: -130, y: -70 };
    digitsPos[6] = { x: -160, y: 0 };
    digitsPos[7] = { x: -140, y: +70 };
    digitsPos[8] = { x: -80, y: +140 };
    digitsPos[9] = { x: 0, y: +150 };

    me._digits = [];
    for (let i = 0; i < digitsPos.length; ++i) {
      if (digitsPos[i] === null) continue;
      const digit = Here._.add
        .image(center.x + digitsPos[i].x, center.y + digitsPos[i].y, "tiles", i)
        .setDepth(Consts.Depth.PhoneDigits)
        .setInteractive(
          new Phaser.Geom.Circle(
            Consts.Unit.Small,
            Consts.Unit.Small,
            Consts.Unit.Small,
          ),
          Phaser.Geom.Circle.Contains,
        );

      // TODO: delete
      digit.on("pointerover", () => {
        digit.setTint(0x7878ff);
      });

      digit.on("pointerout", () => {
        digit.clearTint();
      });

      me._digits.push(digit);
    }
  }
}
