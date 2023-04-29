import Enums from "./Enums.js";
import { SignalModel } from "./Models.js";

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

    /** @type {SignalModel[]} */
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
        {
            signal: Enums.Signals.C3,
            left: Enums.Angles.n135,
            right: Enums.Angles.p90
        },
        {
            signal: Enums.Signals.D4,
            left: Enums.Angles.n90,
            right: Enums.Angles.p90
        },
        {
            signal: Enums.Signals.E5,
            left: Enums.Angles.p90,
            right: Enums.Angles.n45
        },
        {
            signal: Enums.Signals.F6,
            left: Enums.Angles.p90,
            right: Enums.Angles.p0
        },
        {
            signal: Enums.Signals.G7,
            left: Enums.Angles.p90,
            right: Enums.Angles.p45
        },
        {
            signal: Enums.Signals.H8,
            left: Enums.Angles.p180,
            right: Enums.Angles.p135
        },
        {
            signal: Enums.Signals.I9,
            left: Enums.Angles.n135,
            right: Enums.Angles.p135
        },
        {
            signal: Enums.Signals.J0,
            left: Enums.Angles.n90,
            right: Enums.Angles.p0
        },
        {
            signal: Enums.Signals.K,
            left: Enums.Angles.p135,
            right: Enums.Angles.n90
        },
        {
            signal: Enums.Signals.L,
            left: Enums.Angles.p135,
            right: Enums.Angles.n45
        },
        {
            signal: Enums.Signals.M,
            left: Enums.Angles.p135,
            right: Enums.Angles.p0
        },
        {
            signal: Enums.Signals.N,
            left: Enums.Angles.p135,
            right: Enums.Angles.p45
        },
        {
            signal: Enums.Signals.O,
            left: Enums.Angles.n135,
            right: Enums.Angles.p180
        },
        {
            signal: Enums.Signals.P,
            left: Enums.Angles.p180,
            right: Enums.Angles.n90
        },
        {
            signal: Enums.Signals.Q,
            left: Enums.Angles.p180,
            right: Enums.Angles.n45
        },
        {
            signal: Enums.Signals.R,
            left: Enums.Angles.p180,
            right: Enums.Angles.p0
        },
        {
            signal: Enums.Signals.S,
            left: Enums.Angles.p180,
            right: Enums.Angles.p45
        },
        {
            signal: Enums.Signals.T,
            left: Enums.Angles.n135,
            right: Enums.Angles.n90
        },
        {
            signal: Enums.Signals.U,
            left: Enums.Angles.n135,
            right: Enums.Angles.n45
        },
        {
            signal: Enums.Signals.V,
            left: Enums.Angles.n90,
            right: Enums.Angles.p45
        },
        {
            signal: Enums.Signals.W,
            left: Enums.Angles.p0,
            right: Enums.Angles.n45
        },
        {
            signal: Enums.Signals.X,
            left: Enums.Angles.p45,
            right: Enums.Angles.n45
        },
        {
            signal: Enums.Signals.Y,
            left: Enums.Angles.n135,
            right: Enums.Angles.p0
        },
        {
            signal: Enums.Signals.Z,
            left: Enums.Angles.p45,
            right: Enums.Angles.p0
        },
        {
            signal: Enums.Signals.SWITCH,
            left: Enums.Angles.n90,
            right: Enums.Angles.n45
        },
        {
            signal: Enums.Signals.SPACE,
            left: Enums.Angles.p90,
            right: Enums.Angles.p90
        },
        {
            signal: Enums.Signals.CANCEL,
            left: Enums.Angles.n135,
            right: Enums.Angles.p45
        }
    ];
}
