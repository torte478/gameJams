import Consts from "./Consts.js";
import Shelf from "./Shelf.js";
import Transport from "./Transport.js";

export default class Collection {
  /** @type {Shelf[]} */
  _shelfs = [];

  _positionX = 0;

  /** @type {Transport} */
  _transport;

  constructor() {
    const me = this;

    const capacity = 8;
    for (let i = 0; i < capacity; ++i) {
      const shelf = new Shelf();
      shelf.init(i);
      shelf.toGameObj().setPosition(i * Consts.Shelf.Width, 350);
      me._shelfs.push(shelf);
    }

    me._transport = new Transport(40, 10.0, 10.0);
  }

  update(deltaTime) {
    const me = this;

    const velocityX = me._transport.getVelocity(deltaTime);
    if (Math.abs(velocityX) < 0.01) return;

    const shiftX = -velocityX;

    for (let i = 0; i < me._shelfs.length; ++i) {
      const shelf = me._shelfs[i];
      const shelfObj = shelf.toGameObj();
      shelfObj.setPosition(shelfObj.x + shiftX, shelfObj.y);

      if (shiftX < 0 && shelfObj.x < -Consts.Shelf.Width) {
        shelfObj.setPosition(
          shelfObj.x + me._shelfs.length * Consts.Shelf.Width,
          shelfObj.y
        );
        shelf.init(shelf.getIndex() + me._shelfs.length);
      }

      if (
        shiftX > 0 &&
        shelfObj.x > me._shelfs.length * Consts.Shelf.Width - Consts.Shelf.Width
      ) {
        shelfObj.setPosition(
          shelfObj.x - me._shelfs.length * Consts.Shelf.Width,
          shelfObj.y
        );
        shelf.init(shelf.getIndex() - me._shelfs.length);
      }
    }
  }
}
