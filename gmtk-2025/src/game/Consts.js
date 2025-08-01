export default class Consts {
  static Viewport = {
    Width: 1000,
    Height: 800,
  };

  static Unit = {
    Normal: 50,
    Small: 25,
    Big: 100,
  };

  static Depth = {
    Tiles: -5000,
    Max: 100000,
  };

  static DrumKit = {
    ViewHeight: 300,
    ViewScrollX: -5000,
    StartPosX: -4900,
    StartPosY: 40,
    CellSize: 50,
    SampleCount: 4,
  };

  static Tempo = 90;
  static BitPerMs = (Consts.Tempo / 60 / 1000) * 2; // 2 - bit per tick
  static FallPeriod = 2;
  static LevelOverlayAtTiles = 3;
}
