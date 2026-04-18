export default class Edge {
  /** @type {Number} */
  _from;

  /** @type {Number} */
  _to;

  constructor(from, to) {
    const me = this;

    me._from = from;
    me._to = to;
  }

  thisIsIt(from, to) {
    const me = this;
    const exists =
      (me._from === from && me._to === to) ||
      (me._from === to && me._to === from);
    return exists;
  }
}
