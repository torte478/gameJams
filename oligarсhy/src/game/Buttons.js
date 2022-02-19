import Phaser from "../lib/phaser.js";
import Consts from "./Consts.js";

import Enums from "./Enums.js";
import Utils from "./Utils.js";

export default class Buttons {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     */
    constructor(factory, index) {
        const me = this;

        const content = [];
        for (let i = 0; i < Object.keys(Enums.ButtonType).length; ++i) {
            const button = factory.image(0, 0, 'buttons', i)
                .setVisible(false);
            content.push(button);
        }

        const angle = Utils.getAngle(index);

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

        if (!button)
            return null;

        return button.frame.name;
    }

    /**
     * @param {Number} type 
     * @returns {Phaser.Geom.Point}
     */
    getButtonPosition(type) {
        const me = this;

        /** @type {Phaser.GameObjects.Image} */
        const button = me._container.getAll()[type];

        return new Phaser.Geom.Point(
            button.x + me._container.x, 
            button.y + me._container.y);
    }

    /**
     * @param {Number[]} types 
     */
    show(types) {
        const me = this;

        const buttons = me._container.getAll();
        for (let i = 0; i < buttons.length; ++i)
            buttons[i].setVisible(Utils.contains(types, i));

        const visible = buttons.filter((b) => b.visible);

        const offset = 20;
        const width = Consts.Sizes.Button.Width;

        const total = visible.length * width + (visible.length - 1) * offset;
        const start = -total / 2 + width / 2;
       
        for (let i = 0; i < visible.length; ++i) 
            visible[i].setPosition(
                start + i  * width + (i > 0 ? offset : 0),
                visible[i].y
            );
    }
}