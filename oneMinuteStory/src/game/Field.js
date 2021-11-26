import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';

export default class Field {

    /** @type {Array} */
    static cells = [
        { x: -256, y: -4128},
        { x: -256, y: -4064},
        { x: -256, y: -4000},
        { x: -256, y: -3936},

        { x: -256, y: -3808},
        { x: -256, y: -3744},
        { x: -256, y: -3680},
        { x: -256, y: -3616},
        
        { x: -128, y: -4128},
        { x: -128, y: -4064},
        { x: -128, y: -4000},
        { x: -128, y: -3936},

        { x: -128, y: -3808},
        { x: -128, y: -3744},
        { x: -128, y: -3680},
        { x: -128, y: -3616},

        { x: 0, y: -4128},
        { x: 0, y: -4064},
        { x: 0, y: -4000},
        { x: 0, y: -3936},

        { x: 0, y: -3808},
        { x: 0, y: -3744},
        { x: 0, y: -3680},
        { x: 0, y: -3616},

        { x: 128, y: -4128},
        { x: 128, y: -4064},
        { x: 128, y: -4000},
        { x: 128, y: -3936},

        { x: 128, y: -3808},
        { x: 128, y: -3744},
        { x: 128, y: -3680},
        { x: 128, y: -3616},
    ]

    /** @type {Number} */
    static grownCount = 3;


    /** @type {Array} */
    carrots;

    /**
     * 
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me.carrots = [];

        const positions = Phaser.Utils.Array.Shuffle(Field.cells.map((x) => x));

        for (let i = 0; i < Field.grownCount; ++i) {
            const carrot = scene.add.sprite(positions[i].x, positions[i].y, 'items', 2);
            me.carrots.push(carrot);
        }

        for (let i = Field.grownCount; i < positions.length; ++i) {
            scene.add.sprite(positions[i].x, positions[i].y, 'items', 0);
        }
    }

    checkCarrot(x, y) {
        const me = this;

        const nearests = me.carrots.filter(
            (carrot) => carrot.active && Phaser.Math.Distance.Between(carrot.x, carrot.y, x, y) < Consts.unit);

        if (nearests.length === 0) {
            return null;
        }

        /** @type {Phaser.GameObjects.Sprite} */
        const carrot = nearests[0];
        const result = { x: carrot.x, y: carrot.y };

        carrot.destroy();

        return result;
    }
}