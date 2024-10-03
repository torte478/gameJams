import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import RoadComponent from './RoadComponent.js';
import InteriorComponent from './InteriorComponent.js';
import Components from './Components.js';
import MoneyComponent from './MoneyComponent.js';
import StratagemComponent from './StratagemComponent.js';

export default class Game {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Components} */
    _components;

    constructor() {
        const me = this;

        const events = new Phaser.Events.EventEmitter();
        me._components = new Components();
        me._components.road = new RoadComponent(events);
        me._components.interior = new InteriorComponent(events);
        me._components.money = new MoneyComponent(events);
        me._components.stratagem = new StratagemComponent(events);

        me._components.road._components = me._components;
        me._components.interior._components = me._components;
        me._components.money._components = me._components;
        me._components.stratagem._components = me._components;

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(100, 10, '', { fontSize: 18, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);

            me._components.money._camera.ignore(me._log);
            me._components.interior._camera.ignore(me._log);
            me._components.stratagem._camera.ignore(me._log);
        });

        Here.Audio.play('theme', { volume: 0.1 , loop: -1});
    }

    update(delta) {
        const me = this;

        if (Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) 
            && Utils.isDebug(Config.Debug.Global)) {
            Here.Audio.stopAll();
            Here._.scene.restart({ isRestart: true });
        }
        

        me._components.update(delta);

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            const mouse = Here._.input.activePointer;

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
                `que: ${me._components.money._paymentIid}\n` +
                `ins: ${me._components.road._insects.length}`;

            me._log.setText(text);
        });
    }
}