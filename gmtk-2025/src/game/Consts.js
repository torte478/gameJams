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
    Max: 100000,
  };

  static DrumMachine = {
    ViewHeight: 300,
    StartPosX: -850,
    StartPosY: 40,
    CellSize: 50,
    SampleCount: 4,
  };

  static Tempo = 90;
  static BitPerMs = (Consts.Tempo / 60 / 1000) * 4;
}
