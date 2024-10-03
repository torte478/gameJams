import Animation from '../framework/Animation.js';
import Button from '../framework/Button.js';
import Here from '../framework/Here.js';
import HereScene from '../framework/HereScene.js';
import Utils from '../framework/Utils.js';

import Game from '../game/Game.js';

export default class EndScene extends HereScene {

    /** @type {Boolean} */
    _isRestart;

    constructor() {
        super('endScene');
    }

    init(data) {
        const me = this;

        me._isRestart = !!data.isRestart;
    }

    preload() {
        super.preload();
        const me = this;

        Utils.loadImage('logo');
        Utils.loadMp3('mainTheme');
        Utils.loadSpriteSheet('insect', 100);
        Utils.loadImage('passengerOutside');
        Utils.loadImage('mainSmoke');
    }

    /** @type {Phaser.GameObjects.Sprite[]} */
    _sprites = [];

    create() {
        const me = this;

        Here._.add.image(500, 200, 'logo');

        const smoke = Here._.add.image(0, 900, 'mainSmoke').setScale(2).setDepth(1000);
        Here._.add.tween({
            targets: smoke,
            x: 1000,
            duration: 30000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        Here.Audio.play('mainTheme', { volume: 0.75});

        Here._.add.text(500, 350, "MISSION COMPLETE", { fontSize: 42, fontFamily: "Tahoma", fontStyle: 'bold'}).setOrigin(0.5, 0.5);

        Here._.anims.create({
            key: 'insect',
            frames: Animation.getFrames('insect', [ 0, 1 ]),
            frameRate: 4,
            repeat: -1
        });

        for (let i = 0; i < 50; ++i)
            {
                const sprite = Here._.add.sprite(-1000 + Utils.getRandom(0, 1000), 400 + Utils.getRandom(0, 400), 'insect').play('insect');
                me._sprites.push(sprite);
            }

        me._sprites.push(
            Here._.add.sprite(-1100, 550, 'passengerOutside', 1)
        )

    }

    update(time, delta) {
        super.update();

        const me = this;

        if (me._sprites[0].x > 2000)
            return;
         
        for (let i = 0; i < me._sprites.length; ++i)
            me._sprites[i].setX(me._sprites[i].x + 100 * delta / 1000);
    }
}