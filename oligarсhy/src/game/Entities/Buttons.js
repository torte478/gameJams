import Phaser from "../../lib/phaser.js";

import Consts from "../Consts.js";
import Enums from "../Enums.js";
import Helper from "../Helper.js";
import Utils from "../Utils.js";

export default class Buttons {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.Geom.Point} */
    _finishTurnPos;

    /** @type {Number} */
    _side;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Number} side 
     */
    constructor(scene, side) {
        const me = this;

        me._side = side;
        me._finishTurnPos = Utils.buildPoint(800, 800);
        me._container = me._buildContainer(scene, side);
    }

    /**
     * 
     * @param {Phaser.Geom.Point} point 
     * @returns {Number}
     */
    findVisibleIndex(point) {
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

        if (!button.visible)
            return null;

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

        me._updateVisibility(types, concat);
        me._updateVisibleButtonPositions();
    }

    /**
     * @param {Number} type 
     */
    hide(type) {
        const me = this,
              buttons = me._container.getAll(),
              button = buttons[type];

        button
            .setVisible(false)
            .clearTint();

        me.show([], true);
    }

    /**
     * @param {Phaser.Geom.Point} point 
     */
    updateButtonSelection(point) {
        const me = this;

        me._container
            .getAll('visible', true)
            .forEach((button) => {

                const selected = Phaser.Geom.Rectangle.ContainsPoint(
                    button.getBounds(),
                    point);

                if (selected)
                    button.setTintFill(Consts.ButtonSelectionColor);
                else
                    button.clearTint();
            });
    }

    _buildContainer(scene, side) {

        const content = [];
        for (let i = 0; i < Object.keys(Enums.ActionType).length; ++i) {
            const button = scene.add.image(0, 0, 'buttons', i)
                .setVisible(false)
                .setTintFill();
            content.push(button);
        }

        const location = Helper.rotate(Utils.buildPoint(0, 450), side);
        const angle = Helper.getAngle(side);

        return scene.add.container(location.x, location.y, content)
            .setAngle(angle);
    }

    _updateVisibleButtonPositions() {
        const me = this;
        
        const buttons = me._container.getAll();

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

    _updateVisibility(types, concat) {
        const me = this;

        const buttons = me._container.getAll();

        for (let i = 0; i < buttons.length; ++i) {
            const visible = !!concat && buttons[i].visible 
                            || Utils.contains(types, i);

            buttons[i].setVisible(visible)

            if (!visible)
                buttons[i].clearTint();
        }
    }
}