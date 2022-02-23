import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Utils from './Utils.js';

export default class Graphics {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Image} */
    _fade; 

    /** @type {Phaser.GameObjects.Group} */
    _phantom;

    constructor(scene) {
        const me = this;

        me._scene = scene;

        me._fade = scene.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'fade')
            .setDepth(Consts.Depth.Fade)
            .setScrollFactor(0)
            .setAlpha(0);

        me._phantom = scene.add.group();
    }

    runFade(callBack){
        const me = this;

        me._scene.tweens.createTimeline()
            .add({
                targets: me._fade,
                alpha: { from: 0, to: 1 },
                duration: Config.Speed.Teleport / 2,
                ease: 'Sine.easeOut',
                onComplete: () => callBack()
            })
            .add({
                targets: me._fade,
                alpha: { from: 1, to: 0 },
                duration: Config.Speed.Teleport / 2,
                ease: 'Sine.easeOut',
            })
            .play();
    }

    runPhantom(position, layer, nextLayer, entities) {
        const me = this;

        const targets = [];

        entities.tweens.forEach((tween) => {
            for (let i = 0; i < tween.targets.length; ++i) {

                if (tween.layer != nextLayer)
                    continue;

                /** @type {Phaser.GameObjects.Sprite} */
                const origin = tween.targets[i];

                /** @type {Phaser.GameObjects.Sprite} */
                const sprite = me._phantom.create(
                    origin.x, 
                    layer * Consts.Viewport.Height + origin.y % Consts.Viewport.Height, 
                    origin.texture, 
                    origin.frame.name);
                sprite.setFlipX(origin.flipX);

                targets.push(sprite);
            }
        });

        const tiles = entities.map.getSolidTiles(
            position,
            200,
            layer,
            nextLayer);

        for (let i = 0; i < tiles.length; ++i) {
            const item = tiles[i]
            targets.push(me._phantom.create(item.x, item.y, 'tiles', item.index));
        }

        for (let i = 0; i < targets.length; ++i) {
            targets[i]
                .setDepth(Consts.Depth.Phantom)
                .setTintFill(nextLayer > layer ? 0xe9ac00 : 0x230fcf);
        }

        me._scene.tweens.add({
            targets: targets,
            alpha: { from: 1, to: 0 },
            duration: 2000,
            ease: 'Sine.easeOut',
            onComplete: () => {
                for (let obj in targets)
                    me._phantom.killAndHide(obj);
            }
        });
    }
}