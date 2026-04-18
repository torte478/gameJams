import Here from "../framework/Here.js";
import Config from "./Config.js";
import Consts from "./Consts.js";

export default class TowerMenu {
  /** @type {Phaser.GameObjects.Image[]} */
  _items = [];

  /** @type {Phaser.GameObjects.Text} */
  _itemTexts = [];

  /** @type {Phaser.GameObjects.Container} */
  _container;

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
      const item = Here._.add.image(
        startX + column * tileSize + offset * column,
        startY + row * tileSize + offset * row,
        "towerMenuItem",
      );
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

  /**
   * @returns {Phaser.GameObjects.Container}
   */
  toGameObj() {
    const me = this;

    return me._container;
  }
}
