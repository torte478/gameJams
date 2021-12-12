import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';
import Player from './Player.js';
import Rules from './Rules.js';
import Stair from './Stair.js';

export default class Intro {

    /** @type {Phaser.Scene} */
    scene;

    /** @type {Rules} */
    rules;

    state;
    stair;

    constructor(scene, rules) {
        const me = this;

        me.scene = scene;
        me.rules = rules;

        me.scene.tweens.add({
            targets: me.scene.add.image(500, 400, 'fade')
                .setScrollFactor(0)
                .setDepth(1000),
            alpha: { from: 1, to : 0 },
            duration: 2000
        });

        const levelText = me.scene.add
            .text(
                Consts.viewSize.width / 2 - 200,
                Consts.viewSize.height / 2 - 50,
                `Level ${me.rules.level + 1} / 5`,
                { fontSize: 72, backgroundColor: '#000' })
            .setScrollFactor(0)
            .setDepth(1000);

        me.scene.time.delayedCall(
            3000,
            () => levelText.destroy());

        me.state = Consts.introState;
        me.stair = new Stair(me.scene, 2050, Consts.height.roof, Consts.height.floor, Consts.stairType.ROOF);
    }

    /**
     * 
     * @param {Player} player 
     * @param {Boolean} isXDown 
     * @param {Boolean} isUpDown 
     */
    checkIntro(player, isXDown, isUpDown, isDownDown) {
        const me = this;

        switch (me.state) {
            case 'knock0':
                return me.checkKnock(player, isXDown, 0, 225, 6000);

            case 'knock1':
                return me.checkKnock(player, isXDown, 1, 2180, 2000);

            case 'knock2':
                return me.checkKnock(player, isXDown, 2, 2780, 500);

            case 'roof':
                return me.checkRoof(player, isUpDown);

            case 'jump':
                return me.checkJump(player, isDownDown);

            default:
                break;
        }

        return false;
    }

    checkJump(player, isDown) {
        const me = this;

        const jump = isDown
            && Phaser.Math.Distance.Between(
                player.container.x, 
                player.container.y, 
                2050, 
                Consts.height.roof) < 50;

        if (!jump)
            return false;

        me.stair.move(player.container)

        me.state = 'halt';
    }

    /**
     * 
     * @param {Player} player 
     * @param {Boolean} isUpDown 
     */
    checkRoof(player, isUpDown) {
        const me = this;

        const roof = isUpDown
            && Phaser.Math.Distance.Between(
                player.container.x, 
                player.container.y, 
                2925, 
                Consts.height.floor) < 100;

        if (!roof)
            return false;

        player.isBusy = true;
        player.sprite.stop();
        player.container.body.setVelocityX(0);
        player.container.setX(2900);

        me.scene.tweens.add({
            targets: player.container,
            y: Consts.height.roof,
            duration: 3000,
            onComplete: () => { player.isBusy = false }
        });

        me.state = 'jump';

        return false;
    }

    checkKnock(player, isXDown, index, pos, firstDuration) {
        const me = this;

        const knock = 
            isXDown 
            && Phaser.Math.Distance.Between(
                player.container.x, 
                player.container.y, 
                pos, 
                Consts.height.floor) < 100;

        if (!knock) 
            return false;

        if (me.rules.getOutOfTime()[index + 1]) {
            me.state = `knock${index + 1}`;
            console.log('next!');
            return true;
        }
        
        player.startHappy();

        const botSkinIndex = me.rules.getBotSkinIndex(index);

        const bot = me.scene.add.sprite(pos + 50, Consts.height.floor, 'kids')
            .play(`kid_${botSkinIndex}_knock`)
            .setFlipX(true);

        const timeline = me.scene.tweens.createTimeline()
            .add({
                targets: bot,
                x: 2925,
                duration: firstDuration,
                delay: 2000,
                onStart: () => { 
                    bot.setFlipX(false);
                    bot.play(`kid_${botSkinIndex}_walk`)
                }
            })
            .add({
                targets: bot,
                y: Consts.height.roof,
                duration: 3000
            })
            .add({
                targets: bot,
                x: 2060,
                duration: 2000,
                onStart: () => { bot.setFlipX(true) }
            })
            .add({
                targets: bot,
                x: 1960,
                y: Consts.height.roof - 50,
                duration: 250,
                ease: 'Sine.easeOut'
            })
            .add({
                targets: bot,
                x: 1760,
                y: 1000,
                duration: 500,
                ease: 'Sine.easeIn',
                onComplete: () => { bot.destroy(); },
                onUpdate: () => {
                    const camera = me.scene.cameras.main;
                    if (bot.x < camera.scrollX - 100
                        || bot.x > camera.scrollX + Consts.viewSize.width + 100
                        || bot.y < camera.scrollY - 100
                        || bot.y > camera.scrollY + Consts.viewSize.height + 100) {

                            bot.setVisible(false);
                        }
                }
            })
            .play();
        
        me.state = index < 2
            ? `knock${index + 1}`
            : 'roof';

        return true;
    }
}