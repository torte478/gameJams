import Enums from "./Enums.js";
import SignalConfig from "./SignalConfig.js";

export default class Consts {

    static Viewport = {
        Width: 1000,
        Height: 800
    };

    static Unit = {
        Normal: 50,
        Small: 25,
        Big: 100
    };

    static Depth = {
        Max: 100000
    };

    /** @type {SignalConfig[]} */
    static Signals = [
        {
            signal: Enums.Signals.A1,
            left: Enums.Angles.p135,
            right: Enums.Angles.p90
        },
        {
            signal: Enums.Signals.B2,
            left: Enums.Angles.p180,
            right: Enums.Angles.p90
        },
    ];
}
