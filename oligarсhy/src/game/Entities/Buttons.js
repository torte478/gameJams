import Phaser from "../../lib/phaser.js";

import Consts from "../Consts.js";
import Enums from "../Enums.js";
import Groups from "./Groups.js";
import Helper from "../Helper.js";
import Utils from "../Utils.js";

export default class Buttons {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.GameObjects.Container} */
    _finishTurnPos;

    /** @type {Number} */
    _side;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Number} index 
     */
    constructor(scene, index) {
        const me = this;

        const content = [];
        for (let i = 0; i < Object.keys(Enums.ActionType).length; ++i) {
            const button = scene.add.image(0, 0, 'buttons', i)
                .setVisible(false)
                .setTintFill();
            content.push(button);
        }

        me._side = index;
        const angle = Helper.getAngle(index);

        const location = Helper.rotate(Utils.buildPoint(0, 450), index);

        me._container = scene.add.container(location.x, location.y, content)
            .setAngle(angle);

        me._finishTurnPos = Utils.buildPoint(800, 800);
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

        const rotated = Helper.rotate(Utils.toPoint(button), me._side);

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
            buttons[i].setVisible(visible)
            if (!visible)
                buttons[i].clearTint();
        }

        const visibleButtons = buttons.filter(
            (b, i) => b.visible 
                      && i != Enums.ActionType.NEXT_TURN);

        const offset = 20;
        const width = Consts.Sizes.Button.Width;

        const total = visibleButtons.length * width 
                      + (visibleButtons.length - 1) * offset;
                      
        const start = -total / 2 + width / 2;
       
        for (let i = 0; i < visibleButtons.length; ++i)  {
            const position = Utils.buildPoint(
                    start + i  * width + (i > 0 ? offset : 0),
                    visibleButtons[i].y        
                );
            visibleButtons[i].setPosition(position.x, position.y);
        }   

        if (Utils.contains(types, Enums.ActionType.NEXT_TURN)) {
            buttons[Enums.ActionType.NEXT_TURN].setPosition(
                me._finishTurnPos.x,
                me._finishTurnPos.y
            );
        }
    }

    /**
     * @param {Number} type 
     */
    hide(type) {
        const me = this;

        me._container.getAll()[type]
            .setVisible(false)
            .clearTint();
        me.show([], true);
    }

    updateButtonSelection(point) {
        const me = this;

        me._container.getAll('visible', true).forEach((button) => {
            const selected = Phaser.Geom.Rectangle.ContainsPoint(
                button.getBounds(),
                point);

            if (selected)
                button.setTintFill(0xd4d6e1);
            else
                button.clearTint();
        });
    }
}