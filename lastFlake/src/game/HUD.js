import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';
import Rules from './Rules.js';

export default class HUD {

    /** @type {Phaser.GameObjects.Container} */
    container;

    /** @type {Rules} */
    rules;

    scoreText;
    heads;
    defeatText;
    timerText;
    
    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Rules} rules
     */
    constructor(scene, rules, headIndicies, outOfTime) {
        const me = this;

        me.rules = rules;

        const scoreStyle = { fontSize: 24 }
        me.scoreText = [
            scene.add.text(-400, 20, 'x0', scoreStyle),
            scene.add.text(-190, 20, 'x0', scoreStyle),
            scene.add.text(230, 20, 'x0', scoreStyle),
            scene.add.text(420, 20, 'x0', scoreStyle)
        ];

        me.heads = [
            scene.add.sprite(-440, 32, 'heads', headIndicies[0]),
            scene.add.sprite(-230, 32, 'heads', headIndicies[1]),
            scene.add.sprite(180, 32, 'heads', headIndicies[2]),
            scene.add.sprite(380, 32, 'heads', headIndicies[3]),
        ];

        const defeatHeight = 12;
        const defeatStyle = { fontSize: 18, backgroundColor: '#000' }
        const angle = 15;
        me.defeatText = [
            scene.add.text(-350, defeatHeight, 'out of time', defeatStyle).setVisible(outOfTime[0]).setAngle(angle),
            scene.add.text(-250, defeatHeight, 'out of time', defeatStyle).setVisible(outOfTime[1]).setAngle(angle),
            scene.add.text(160, defeatHeight, 'out of time', defeatStyle).setVisible(outOfTime[2]).setAngle(angle),
            scene.add.text(360, defeatHeight, 'out of time', defeatStyle).setVisible(outOfTime[3]).setAngle(angle)
        ];

        me.timerText = scene.add.text(-5, 17, '0', { fontSize: 40 });

        me.container = scene.add.container(Consts.viewSize.width / 2, 0, [ 
            scene.add.image(0, 35, 'hud'),
            me.scoreText[0],
            me.scoreText[1],
            me.scoreText[2],
            me.scoreText[3],
            me.heads[0],
            me.heads[1],
            me.heads[2],
            me.heads[3],
            me.defeatText[0],
            me.defeatText[1],
            me.defeatText[2],
            me.defeatText[3],
            me.timerText
        ])
            .setScrollFactor(0)
            .setDepth(10000);
    }

    update() {
        const me = this;

        for (let i = 0; i < me.rules.scores.length; ++i)
            me.scoreText[i].text = `x${me.rules.scores[i]}`;

        me.timerText.text = me.rules.timer | 0;
    }
}