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
    _tween;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene, x, y, frame) {
        const me = this;

        me._selection = scene.add.image(0, 0, 'dice', 15)
            .setVisible(false);

        me._sprite = scene.add.sprite(0, 0, 'dice', frame);

        me._container = scene.add.container(x, y, 
            [
                me._selection,
                me._sprite
            ])
            .setDepth(Consts.Depth.Pieces);

        scene.physics.world.enable(me._container);

        me._container
            .body
            .setBounce(1, 1)
            .setCollideWorldBounds(true)
            .setBoundsRectangle(new Phaser.Geom.Rectangle(-700, -700, 1400, 1400));

        me._tween = scene.tweens.add({
            targets: me._selection,
            scale: { from: 1.25, to: 0.9 },
            duration: Consts.Speed.Selection,
            yoyo: true,
            repeat: -1
        });
        me._tween.pause();
    }

    toGameObject() {
        const me = this;

        return me._container;
    }

    play(anim) {
        const me = this;

        me._sprite.play(anim);

        return me;
    }

    stop(frame) {
        const me = this;

        me._sprite
            .stop()
            .setFrame(frame);

        me._container.body
            .setVelocity(0)
            .setAngularVelocity(0)

        return me;
    }

    roll(anim) {
        const me = this;

        me._sprite.play(anim);
                            
        me._container.body
            .setVelocity(
                Utils.getRandom(-Consts.DicePhysics.Speed, Consts.DicePhysics.Speed, 0),
                Utils.getRandom(-Consts.DicePhysics.Speed, Consts.DicePhysics.Speed, 0))
            .setAngularVelocity(
                Utils.getRandom(-Consts.DicePhysics.Angle, -Consts.DicePhysics.Angle, 10))
    }

    select() {
        const me = this;

        me._selection.setVisible(true);
        me._tween.resume();
    }

    unselect() {
        const me = this;

        me._selection.setVisible(false);
        me._tween.pause();
    }
}