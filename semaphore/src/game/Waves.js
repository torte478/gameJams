import Here from '../framework/Here.js';
import Phaser from '../lib/phaser.js';

export default class Waves { 

    constructor() {
        const me = this;

        const period = 10000;

        const path1 = new Phaser.Curves.Path();
        path1.add(new Phaser.Curves.Ellipse(0, 0, 30));

        const tint1 = 0x128FDE;
        const wave1 = Here._.add
            .follower(path1, 0, 100, 'wave')
            .setScale(0.9)
            .setTint(tint1)
            .startFollow({
                repeat: -1, 
                duration: period * 1.5,
                startAt: 0.25});

        const path2 = new Phaser.Curves.Path();
        path2.add(new Phaser.Curves.Ellipse(0, 0, 30));

        const tint2 = 0x19C8FF;
        const wave2 = Here._.add
            .follower(path2, 0, 200, 'wave')
            .setScale(0.9)
            .setFlipX(true)
            .setTint(tint2)
            .startFollow({
                repeat: -1, 
                duration: period * 0.8,
                startAt: 0.75});

        const path3 = new Phaser.Curves.Path();
        path3.add(new Phaser.Curves.Ellipse(0, 0, 100));

        const wave3 = Here._.add
            .follower(path3, 0, 300, 'wave')
            .startFollow({
                repeat: -1, 
                duration: period});
    }
}