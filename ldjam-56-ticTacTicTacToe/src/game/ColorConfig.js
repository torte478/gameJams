export default class ColorConfig {
  main;
  background;
  selection;
  item;

  constructor(main, background, selection, item) {
    const me = this;
    me.main = main;
    me.background = background;
    me.selection = selection;
    me.item = item;
  }
}
