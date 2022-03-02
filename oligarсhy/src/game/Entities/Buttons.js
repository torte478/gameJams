import Phaser from "../../lib/phaser.js";

import Consts from "../Consts.js";
import Enums from "../Enums.js";
import Helper from "../Helper.js";
import Utils from "../Utils.js";

export default class Buttons {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     */
    constructor(factory, index) {
        const me = this;

        const content = [];
        for (let i = 0; i < Object.keys(Enums.ActionType).length; ++i) {
            const button = factory.image(0, 0, 'buttons', i)
                .setVisible(false);
            content.push(button);
        }

        const angle = Helper.getAngle(index);

        const location = Phaser.Math.RotateAround(
            new Phaser.Geom.Point(0, 450), 0, 0, Phaser.Math.DegToRad(angle));

        me._container = factory.container(location.x, location.y, content)
            .setAngle(angle);
    }

    /**
     * 
     * @param {Phaser.Geom.Point} point 
     * @returns {Number}
     */
    checkClick(point) {
        const me = this;

        /** @type {Phaser.GameObjects.Image} */
        const button = Utils.firstOrDefault(
            me._container.getAll(),
            (b) => b.visible
                   && Phaser.Geom.Rectangle.ContainsPoint(b.getBounds(), point));

        return !!button
            ? button.frame.name
            : null;
    }

    /**
     * @param {Number} type 
     * @returns {Phaser.Geom.Point}
     */
    getButtonPosition(type) {
        const me = this;

        /** @type {Phaser.GameObjects.Image} */
        const button = me._container.getAll()[type];

        const rotated = Phaser.Math.RotateAround(
            new Phaser.Geom.Point(
                button.x, 
                button.y),
            0,
            0,
            Phaser.Math.DegToRad(me._container.angle)) 

        const world = new Phaser.Geom.Point(
            rotated.x + me._container.x, 
            rotated.y + me._container.y);

        return world;
    }

    /**
     * @param {Number[]} types 
     * @param {Boolean} concat
     */
    show(types, concat) {
        const me = this;

        const buttons = me._container.getAll();
        for (let i = 0; i < buttons.length; ++i) {
            const visible = !!concat && buttons[i].visible 
                            || Utils.contains(types, i);
            buttons[i].setVisible(visible);
        }

        const visibleButtons = buttons.filter((b) => b.visible);

        const offset = 20;
        const width = Consts.Sizes.Button.Width;

        const total = visibleButtons.length * width 
                      + (visibleButtons.length - 1) * offset;
                      
        const start = -total / 2 + width / 2;
       
        for (let i = 0; i < visibleButtons.length; ++i) 
            visibleButtons[i].setPosition(
                start + i  * width + (i > 0 ? offset : 0),
                visibleButtons[i].y
            );
    }
}