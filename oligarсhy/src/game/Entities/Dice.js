import Phaser from "../../lib/phaser.js";

import Consts from "../Consts.js";
import Utils from "../Utils.js";

export default class Dice {

    /** @type {Phaser.GameObjects.Image} */
    _selection;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.Tweens.Tween} */
    _selectTween;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} frame 
     */
    constructor(scene, x, y, frame) {
        const me = this;

        me._selection = scene.add.image(0, 0, 'dice', 15)
            .setVisible(false);

        me._sprite = scene.add.sprite(0, 0, 'dice', frame);

        me._container = me._buildContainer(scene, x, y, [ me._selection, me._sprite,  ]);

        me._selectTween = scene.tweens.add({
            targets: me._selection,
            scale: { from: 1.25, to: 0.9 },
            duration: Consts.Speed.Selection,
            yoyo: true,
            repeat: -1
        }).pause();
    }

    /**
     * @returns {Phaser.GameObjects.Container}
     */
    toGameObject() {
        const me = this;

        return me._container;
    }

    /**
     * @param {String} anim 
     */
    startRoll(anim) {
        const me = this;

        me._sprite.play(anim);
                            
        me._container.body
            .setVelocity(
                Utils.getRandom(-Consts.DicePhysics.Speed, Consts.DicePhysics.Speed, 0),
                Utils.getRandom(-Consts.DicePhysics.Speed, Consts.DicePhysics.Speed, 0))
            .setAngularVelocity(
                Utils.getRandom(-Consts.DicePhysics.Angle, -Consts.DicePhysics.Angle, 10))
    }

    /**
     * @param {Number} frame 
     * @returns {Dice}
     */
    stopRoll(frame) {
        const me = this;

        me._sprite
            .stop()
            .setFrame(frame);

        me._container.body
            .setVelocity(0)
            .setAngularVelocity(0)

        return me;
    }

    /**
     */
    select() {
        const me = this;

        me._selection.setVisible(true);
        me._selectTween.resume();
    }

    /**
     */
    unselect() {
        const me = this;

        me._selection.setVisible(false);
        me._selectTween.pause();
    }

    /**
     */
    hide() {
        const me = this;

        me._container.setVisible(false);
    }

    /**
     */
    show() {
        const me = this;

        me._container.setVisible(true);
    }

    /**
     * 
     * @returns {Object}
     */
    getConfig() {
        const me = this;

        return {
            pos: Utils.toPoint(me._container),
            value: me._sprite.frame.name
        };
    }

    /**
     * @param {Phaser.Geom.Point} pos 
     */
    setPosition(pos) {
        const me = this;

        me._container.setPosition(pos.x, pos.y);
    }

    _buildContainer(scene, x, y, content) {
        const container = scene.add.container(x, y, content)
            .setDepth(Consts.Depth.Pieces);

        scene.physics.world.enable(container);

        container
            .body
            .setBounce(1, 1)
            .setCollideWorldBounds(true)
            .setBoundsRectangle(new Phaser.Geom.Rectangle(-700, -700, 1400, 1400));
        
        return container;
    }
}