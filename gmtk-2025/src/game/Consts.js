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
    Overlay: -1000,
    OverOverlay: 5000,
    Max: 100000,
  };

  static DrumKit = {
    ViewHeight: 300,
    ViewScrollX: -5000,
    StartPosX: -4815,
    StartPosY: 40,
    CellSize: 50,
    SampleCount: 4,
    MaxBitCount: 16,
    DefaultBitLength: 8,
  };

  static Tempo = 45;
  static BitPerMs = (Consts.Tempo / 60 / 1000) * 2; // 2 - bit per tick
  static FallPeriod = 2;
  static LevelOverlayAtTiles = 3;

  // yellow: #E6EE3D
  // black #022518
  // white #83a897
  // blue #2f83db
  // red #cd1e22
  // purple #9e557f
}
