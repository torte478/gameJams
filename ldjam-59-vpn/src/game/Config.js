export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
  };

  static Start = {
    Towers: [
      { x: 300, y: 400 },
      { x: 700, y: 500 },
      // { x: 550, y: 200 },
      // { x: 400, y: 700 },
    ],
  };

  static Speed = {
    Signal: 100,
  };
}
