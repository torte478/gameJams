export class SignalModel {

    /** @type {Number} */
    signal;

    /** @type {Number} */
    left;

    /** @type {Number} */
    right;
}

export class ContainerOffset {

    /** @type {Number} */
    x;
    
    /** @type {Number} */
    y;
    
    /** @type {Number} */
    angle;
}

export class SinCoeffs {
    /** @type {Number} */
    min;

    /** @type {Number} */
    max;
    
    /** @type {Number} */
    a;

    /** @type {Number} */
    b;

    /** @type {Number} */
    amplitude;

    /** @type {Number} */
    start;
}

export class SignalProcessResult {

    /** @type {Boolean} */
    isLevelComplete;

    /** @type {Boolean} */
    currentChanged;

    /** @type {Boolean} */
    from;

    /** @type {String} */
    to;

    /** @type {Boolean} */
    correct;

    /** @type {Boolean} */
    cancel;
}

export class PlayerContainerPosition {

    /** @type {Number} */
    x;

    /** @type {Number} */
    y;

    /** @type {Number} */
    angle;
}

export class LevelModel {

    /** @type {String} */
    message;

    /** @type {Boolean} */
    isMainMenu;

    /** @type {Boolean} */
    isTutorial;

    /** @type {SinCoeffs} */
    sinXCoefs;

    /** @type {SinCoeffs} */
    sinYCoefs;

    /** @type {SinCoeffs} */
    sinAngleCoefs;

    /** @type {Number} */
    signalTimeout;

    /** @type {Number} */
    bonusTimeMs;

    /** @type {Boolean} */
    isSeagullPoop;
}