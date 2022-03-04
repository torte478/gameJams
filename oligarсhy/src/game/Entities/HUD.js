import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';

export default class HUD {

    /** @type {Phaser.GameObjects.GameObjectFactory} */
    _factory;

    /** @type {Number} */
    _state;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    _infoItems = {
        /** @type {Phaser.GameObjects.Text} */
        caption: null,

        /** @type {Phaser.GameObjects.Image} */
        icon: null,

        /** @type {Phaser.GameObjects.Text} */
        details: null
    }

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     */
    constructor(factory) {
        const me = this;

        me._factory = factory;
        
        const background = factory.image(0, 0, 'hud');
        me._infoItems.caption = factory.text(-25, 0, 'TEST');
        me._infoItems.icon = factory.image(0, 60, 'icons', 0)
            .setScale(0.75);

        me._infoItems.details = factory.text(-75, 125, '');

        me._container = factory.container(
            Consts.Sizes.HUD.Width / -2, 
            Consts.Sizes.HUD.Height / 2,
            [
                background,
                me._infoItems.caption,
                me._infoItems.icon,
                me._infoItems.details,
            ])
            .setScrollFactor(0)
            .setDepth(Consts.Depth.HUD);

        me._state = Enums.HudState.HIDDEN;
    }

    show() {
        const me = this;

        if (me._state != Enums.HudState.HIDDEN)
            return;

        me._state = Enums.HudState.MOVING;

        me._factory.tween({
            targets: me._container,
            x: Consts.Sizes.HUD.Width / 2,
            duration: 500,
            ease: 'Sine.easeOut',
            onComplete: () => {
                me._state = Enums.HudState.VISIBLE;
            }
        });
    }

    hide() {
        const me = this;

        if (me._state != Enums.HudState.VISIBLE)
            return;

        me._state = Enums.HudState.MOVING;

        me._factory.tween({
            targets: me._container,
            x: Consts.Sizes.HUD.Width / -2 ,
            duration: 500,
            ease: 'Sine.easeIn',
            onComplete: () => {
                me._state = Enums.HudState.HIDDEN;
            }
        });
    }

    showField(index) {
        const me = this;

        const config = Config.Fields[index];
        
        me._setFieldInfoVisible(true);

        switch (config.type) {
            case Enums.FieldType.PROPERTY: {
                me._infoItems.icon
                    .setTexture('icons', config.icon);

                me._infoItems.caption
                    .setText(config.name);

                const details = 
                    'BUY\n' +
                    `house: ${config.costHouse}\n\n` +
                    'RENT\n' + 
                    `base: ${config.rent[Enums.PropertyRentIndex.BASE]}\n` + 
                    `full color: ${config.rent[Enums.PropertyRentIndex.COLOR]}\n` + 
                    `1 house: ${config.rent[Enums.PropertyRentIndex.ONE]}\n` + 
                    `2 houses: ${config.rent[Enums.PropertyRentIndex.TWO]}\n` + 
                    `3 houses: ${config.rent[Enums.PropertyRentIndex.THREE]}\n` + 
                    `4 houses: ${config.rent[Enums.PropertyRentIndex.FOUR]}\n` + 
                    `hotel: ${config.rent[Enums.PropertyRentIndex.HOTEL]}\n\n` +
                    'SELL\n' + 
                    `house: ${config.costHouse / 2}\n` + 
                    `property: ${config.cost / 2}`;
                me._infoItems.details.setText(details)

                break;
            }

            case Enums.FieldType.UTILITY: {

                me._infoItems.caption
                    .setText(config.name);

                me._infoItems.icon
                    .setTexture('icons_big', config.icon);

                    const details = 
                    'RENT\n' + 
                    `1 utility:\n`+
                    `   ${config.rent[0]} X dices\n\n` + 
                    `2 utilities:\n` + 
                    `   ${config.rent[1]} x dices\n\n` + 
                    `SELL: ${config.cost / 2}`;
                me._infoItems.details.setText(details)

                break;
            }

            case Enums.FieldType.RAILSTATION: {
                me._infoItems.caption
                    .setText(config.name);

                me._infoItems.details.setVisible(false);

                break;
            }

            default:
                me._setFieldInfoVisible(false);
        }
    }

    hideField() {
        const me = this;
        
        me._setFieldInfoVisible(false);
    }

    _setFieldInfoVisible(visible) {
        const me = this;

        me._infoItems.caption.setVisible(visible);
        me._infoItems.icon.setVisible(visible);
        me._infoItems.details.setVisible(visible);
    }
}