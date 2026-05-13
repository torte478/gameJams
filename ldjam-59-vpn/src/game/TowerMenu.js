import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
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

  /** @type {Phaser.GameObjects.Image} */
  _background;

  constructor() {
    const me = this;

    me._background = Here._.add.image(0, 10, "towerMenu", 0);

    const rowLength = 3; // yes
    const tileSize = 20; // yes yes

    const startX = -27;
    const startY = -5;
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

    const children = [me._background];
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
          .setText(
            Utils.indexToLetter(me.currentTower._signalQueue[i].toTowerId),
          );
      } else {
        me._items[i].setVisible(false);
        me._itemTexts[i].setVisible(false);
      }
    }

    me._background.setFrame(me.currentTower._isAutoMode ? 0 : 1);
  }

  /**
   * @returns {Phaser.GameObjects.Container}
   */
  toGameObj() {
    const me = this;

    return me._container;
  }

  isToggleClick(mousePos) {
    const me = this;

    const diffX = me._container.x - mousePos.x;
    const diffY = me._container.y - mousePos.y;
    // return diffX >= -17 && diffX <= 34 && diffY >= -44 && diffY <= -30; // AAaaAaaaAAaaa
    return diffX >= -34 && diffX <= 43 && diffY >= 30 && diffY <= 44; // AAaaAaaaAAaaa
  }

  getSignalAtMouse() {
    const me = this;

    if (!me._selectedItem) {
      return null;
    }

    return {
      index: me._selectedItem.signalIndex,
      pos: Utils.buildPoint(
        me._container.x + me._selectedItem.x,
        me._container.y + me._selectedItem.y,
      ),
    };
  }

  _onPointerOverItem(index) {
    const me = this;

    const sprite = me._items[index];
    sprite.setTint(Config.Color.Green);

    me._selectedItem = sprite;
  }

  _onPointerOutItem(index) {
    const me = this;

    const sprite = me._items[index];
    sprite.clearTint();

    me._selectedItem = null;
  }
}
