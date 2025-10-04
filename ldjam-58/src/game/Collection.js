import Here from "../framework/Here.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Shelf from "./Shelf.js";

export default class Collection {
  /** @type {Shelf[]} */
  _shelfs = [];

  _positionX = 0;

  constructor() {
    const me = this;

    const capacity = 8;
    for (let i = 0; i < capacity; ++i) {
      const shelf = new Shelf();
      shelf.init(i);
      shelf.toGameObj().setPosition(i * Consts.Shelf.Width, 350);
      me._shelfs.push(shelf);
    }
  }

  update(delta) {
    const me = this;

    const speed = 6000;
    let moveDirection = 0;
    if (Here.Controls.isPressing(Enums.Keyboard.RIGHT)) moveDirection = 1;
    else if (Here.Controls.isPressing(Enums.Keyboard.LEFT)) moveDirection = -1;

    if (moveDirection === 0) return;

    const shift = speed * -moveDirection * (delta / 1000);
    me._positionX += shift;

    for (let i = 0; i < me._shelfs.length; ++i) {
      const shelf = me._shelfs[i];
      const shelfObj = shelf.toGameObj();
      shelfObj.setPosition(shelfObj.x + shift, shelfObj.y);

      if (moveDirection === 1 && shelfObj.x < -Consts.Shelf.Width) {
        shelfObj.setPosition(
          shelfObj.x + me._shelfs.length * Consts.Shelf.Width,
          shelfObj.y
        );
        shelf.init(shelf.getIndex() + me._shelfs.length);
      }

      if (
        moveDirection === -1 &&
        shelfObj.x > me._shelfs.length * Consts.Shelf.Width - Consts.Shelf.Width
      ) {
        shelfObj.setPosition(
          shelfObj.x - me._shelfs.length * Consts.Shelf.Width,
          shelfObj.y
        );
        shelf.init(shelf.getIndex() - me._shelfs.length);
      }
    }

    // const shiftX = speed * dx * (delta / 1000);
    // const shelfs = me._shelfPool.getChildren();
    // for (let i = 0; i < shelfs.length; ++i) {
    //   /** @type {Phaser.GameObjects.Image} */
    //   const shelf = shelfs[i];
    //   if (shelf.active) shelf.setPosition(shelf.x + shiftX, shelf.y);
    // }
  }
}
