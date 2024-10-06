export default class ColorConfig {
  main;
  background;
  selection;

  constructor(m, b, s) {
    const me = this;
    me.main = m;
    me.background = b;
    me.selection = s;
  }
}
