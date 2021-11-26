import Phaser from '../lib/phaser.js';

import Actions from './Actions.js';

import Consts from './Consts.js';

const State = {
    WALK: 1,
    DANCE: 2
}

export default class Bot {
    /** @type {Phaser.Scene} */
    scene;

    /** @type {String} */
    name;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    image;

    /** @type {Array} */
    path;

    /** @type {Number} */
    index;

    /** @type {State}*/
    state;

    /** @type {Number} */
    frameCount;

    /**
     * @param {Phaser.Scene} scene
     * @param {String} image 
     * @param {Array} path 
     */
    constructor(scene, name, path) {
        const me = this;

        me.scene = scene;
        me.name = name;
        
        me.path = path;

        me.image = scene.physics.add.sprite(0, 0, me.name);
        me.image.setPosition(path[0].x, path[0].y);
        me.image.play(me.name + '_walk');
        me.image.on('animationrepeat', me.onAnimationRepeat, me);

        me.index = 0;
        me.frameCount = 0;
        me.state = State.WALK;
    }

    update() {
        const me = this;

        if (me.state === State.WALK) {
            const position = { x: me.image.x, y: me.image.y };
            const target = me.path[me.index];    
            
            if (Phaser.Math.Distance.BetweenPoints(position, target) < Consts.distanceEps) {
                me.nextState();        
            }
        }
    }

    nextState() {
        const me = this;

        me.index = (me.index + 1) % me.path.length;
        
        if (me.path[me.index].action === Actions.DANCE) {
            me.frameCount = 0;
            me.image.body.reset(me.image.x, me.image.y);            

            me.image.play(me.name + '_dance');
            me.state = State.DANCE;
        } else {
            me.scene.physics.moveTo(
                me.image, 
                me.path[me.index].x, 
                me.path[me.index].y, 
                Consts.botSpeed);

            me.image.play(me.name + '_walk');
            me.state = State.WALK;
        }
    }

    onAnimationRepeat() {
        const me = this;

        if (me.state !== State.DANCE)
            return;

        if (++me.frameCount >= Consts.danceLength) {
            me.nextState();
        }
    }
}