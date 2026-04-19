import Here from "../framework/Here.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Tower from "./Tower.js";

export default class TowerMenu {
  /** @type {Phaser.GameObjects.Image[]} */
  _items = [];

  /** @type {Phaser.GameObjects.Text[]} */
  _itemTexts = [];

  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Boolean} */
  isOpen = false;

  /** @type {Tower | null} */
  currentTower = null;

  /** @type {Phaser.GameObjects.Image | null} */
  _selectedItem = null;

  constructor() {
    const me = this;

    const background = Here._.add.image(0, 0, "towerMenu");

    const rowLength = 3; // yes
    const tileSize = 30; // yes yes

    const startX = -30;
    const startY = -30;
    const offset = 5;
    for (let i = 0; i < Config.MaxSignalPerTower; ++i) {
      const row = Math.floor(i / rowLength);
      const column = i % rowLength;
      const item = Here._.add
        .image(
          startX + column * tileSize + offset * column,
          startY + row * tileSize + offset * row,
          "towerMenuItem",
        )
        .setInteractive()
        .on("pointerover", () => me._onPointerOverItem(i), me)
        .on("pointerout", () => me._onPointerOutItem(i), me);

      item.signalIndex = i;

      const text = Here._.add.text(item.x, item.y, "X").setOrigin(0.5, 0.5);

      me._items.push(item);
      me._itemTexts.push(text);
    }

    const children = [background];
    for (const item of me._items) children.push(item);
    for (const text of me._itemTexts) children.push(text);

    me._container = Here._.add
      .container(650, 150, children)
      .setDepth(Consts.Depth.TowerMenu)
      .setVisible(false);

    // me._container
    //   .setSize(background.width, background.height)
    //   .setInteractive()
    //   .on("pointerout", () => {
    //     me._sprite.clearTint();
    //   });
  }

  containsPoint(pos) {
    const me = this;

    return Phaser.Geom.Rectangle.ContainsPoint(me._container.getBounds(), pos);
  }

  close() {
    const me = this;

    me.isOpen = false;
    me._container.setVisible(false);
  }

  /**
   *
   * @param {Tower} tower
   */
  open(tower) {
    const me = this;

    me.isOpen = true;
    me.currentTower = tower;

    me.invalidate();
  }

  /**
   *
   * @param {Tower} tower
   */
  invalidate() {
    const me = this;

    if (!me.isOpen) return;

    for (let i = 0; i < me._items.length; ++i) {
      if (me.currentTower._signalQueue.length > i) {
        me._items[i].setVisible(true);
        me._itemTexts[i]
          .setVisible(true)
          .setText(me.currentTower._signalQueue[i].toTowerId);
      } else {
        me._items[i].setVisible(false);
        me._itemTexts[i].setVisible(false);
      }
    }
  }

  /**
   * @returns {Phaser.GameObjects.Container}
   */
  toGameObj() {
    const me = this;

    return me._container;
  }

  getSignalIndexAtMouse() {
    const me = this;

    if (!me._selectedItem) {
      return null;
    }

    return me._selectedItem.signalIndex;
  }

  _onPointerOverItem(index) {
    const me = this;

    const sprite = me._items[index];
    sprite.setTint(0x44ff44);

    me._selectedItem = sprite;
  }

  _onPointerOutItem(index) {
    const me = this;

    const sprite = me._items[index];
    sprite.clearTint();

    me._selectedItem = null;
  }
}
