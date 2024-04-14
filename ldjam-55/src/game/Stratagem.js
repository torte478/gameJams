import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Enums from "./Enums.js";

export default class Stratagem {

    /** @type {Phaser.GameObjects.Text} */
    _statusText;

    /** @type {Phaser.GameObjects.Sprite[]} */
    _arrows = [];

    /** @type {Phaser.Geom.Point} */
    _pos;

    constructor(index) {
        const me = this;

        const panel = Here._.add.image(4150, 150 + index * 100, 'panel')
        me._pos = Utils.toPoint(panel);

        Here._.add.image(panel.x + 100, panel.y - 10, 'stratagems', 0);

        me._statusText = Here._.add.text(panel.x + 135, panel.y + 20, '12.5s', { fontSize: 20, fontStyle: 'bold'})
            .setOrigin(1, 0,5);

        const descText = Here._.add.text(panel.x - 135, panel.y - 25, 'TEST TEST TEST', {fontSize: 20, fontStyle: 'bold', fontFamily: 'Tahoma'})
            .setOrigin(0, 0.5);

        me._init(index, descText);
    }

    _init(index, description) {
        const me = this;

        if (index == 0)
            me._initInternal(description, 'WIN GAME', [Enums.Arrow.UP, Enums.Arrow.DOWN, Enums.Arrow.LEFT, Enums.Arrow.LEFT, Enums.Arrow.RIGHT]);

        if (index == 1)
            me._initInternal(description, "SHIELD", [Enums.Arrow.RIGHT, Enums.Arrow.RIGHT, Enums.Arrow.UP]);
    }

    _initInternal(descText, descStr, directions) {
        const me = this;

        descText.setText(descStr);
        for (let i = 0; i < directions.length; ++i) {
            const arrow = Here._.add.sprite(me._pos.x - 125 + i * 38, me._pos.y + 20, 'arrows', 0);
            arrow.setAngle(me._getAngle(directions[i]));
            me._arrows.push(arrow);
        }
    }

    _getAngle(direction) {
        const me = this;

        if (direction == Enums.Arrow.UP)
            return 0;
        if (direction == Enums.Arrow.LEFT)
            return -90;
        if (direction == Enums.Arrow.DOWN)
            return 180;
        if (direction == Enums.Arrow.RIGHT)
            return 90;

        throw `unknown direction ${direction}`;
    }
}