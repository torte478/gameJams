import Phaser from '../../lib/phaser.js';

import Utils from '../Utils.js';

import BaseEntity from './BaseEntity.js';
import ButtonConfig from './ButtonConfig.js';
import Entities from './Entities.js';

export default class Button extends BaseEntity {

    /** @type {ButtonConfig} */
    _config;

    /**
     * @param {Number} id 
     * @param {Phaser.Physics.Arcade.StaticGroup} group 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} angle 
     * @param {ButtonConfig} config 
     */
    constructor(id, group, x, y, angle, config) {
        super(id);

        const me = this;

        me._config = config;

        const sprite =  group.create(x, y, 'items', config.isPushed ? 1 : 0).setAngle(angle);

        me._initOrigin(sprite);
    }

    /**
     * 
     * @param {Entities} entities 
     */
    tryPush(entities) {
        const me = this;

        if (me._config.isPushed)
            return false;

        entities.doors
            .getChildren()
            .forEach((door) => { 

                if (Utils.any(me._config.doorsToOpen, (id) => door.entity.id == id))
                    door.entity.open();

                if (Utils.any(me._config.doorsToClose, (id) => door.entity.id == id))
                    door.entity.close();
            });

            entities.buttons
            .getChildren()
                .forEach((button) => { 

                    if (Utils.any(me._config.buttonsToPush, (id) => button.entity.id == id))
                        button.entity.tryPush();

                    if (Utils.any(me._config.buttonsToPull, (id) => button.entity.id == id))
                        button.entity.tryPull();
                });

        me.origin.setFrame(1);
        me._config.isPushed = true;
        return true;
    }

    tryPull() {
        const me = this;

        if (!me._config.isPushed)
            return;

        me.origin.setFrame(0);
        me._config.isPushed = false;
    }
}