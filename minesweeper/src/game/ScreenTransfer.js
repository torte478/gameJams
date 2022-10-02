import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';

export default class ScreenTransfer {

    _scene;

    _button;

    _inCity;

    emmiter;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Status} status
     */
    constructor(scene, status) {
        const me = this;

        me._status = status;
        me._inCity = Config.Levels[status.level].StartInCity;
        me._button = scene.add.sprite(
                Consts.UnitMiddle / 2, 
                Consts.Viewport.Height - Consts.UnitMiddle / 2, 
                'items', 
                me._getFrame())
            .setScrollFactor(0)
            .setDepth(Consts.Depth.UI)
            .setInteractive();

        me._button.on('pointerdown', me._onButtonClick, me);
        me._button.on('pointerover', () => me._button.setScale(1.5), me);
        me._button.on('pointerout', () => me._button.setScale(1), me);

        me.emmiter = new Phaser.Events.EventEmitter();
    }

    onTransferEnd() {
        const me = this;
        me._button.setFrame(me._getFrame());
        me._button.setVisible(true);
    }

    _onButtonClick() {
        const me = this;

        if (me._status.isBusy)
            return;

        me._status.busy();
        me._inCity = !me._inCity;
        me._status.isCity = !me._status.isCity;
        
        me._button.setVisible(false);

        me.emmiter.emit('transfer', me._inCity);
    }

    _getFrame() {
        const me = this;

        return me._inCity ? 18 : 17;
    }
}