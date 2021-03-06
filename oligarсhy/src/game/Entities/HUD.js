import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Utils from '../Utils.js';
import FieldInfo from '../FieldInfo.js';

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

    /** @type {Object[]} */
    _playerItems;

    /** @type {Phaser.GameObjects.image} */
    _selection;

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

        me._selection = factory.image(0, 0, 'hud_select');

        me._infoItems.details = factory.text(-75, 125, '');

        let content = [ background, me._selection ];

        me._playerItems = [];
        const start = -360;
        const offset = 100;
        for (let i = 0; i < Config.PlayerCount; ++i) {
            me._playerItems.push({
                hand: factory.text(85, start + i * offset - 25, '12', Consts.TextStyle.HudMoney).setOrigin(1, 0),
                cards: factory.text(85, start + i * offset, '34', Consts.TextStyle.HudMoney).setOrigin(1, 0),
                total: factory.text(85, start + i * offset + 25 , '56', Consts.TextStyle.HudMoney).setOrigin(1, 0),
            });

            content.push(factory.image(-60, start + i * offset + 10, 'pieces', i*2).setScale(0.75));
            content.push(factory.text(-20, start + i * offset - 25, 'money:', Consts.TextStyle.HudMoney));
            content.push(me._playerItems[i].hand);
            content.push(factory.text(-20, start + i * offset, 'cards:', Consts.TextStyle.HudMoney));
            content.push(me._playerItems[i].cards);
            content.push(factory.text(-20, start + i * offset + 25, 'total:', Consts.TextStyle.HudMoney));
            content.push(me._playerItems[i].total);
        }

        content.push(me._infoItems.caption);
        content.push(me._infoItems.icon);
        content.push(me._infoItems.details);

        me._container = factory.container(
            Consts.Sizes.HUD.Width / -2, 
            Consts.Sizes.HUD.Height / 2,
            content)
            .setScrollFactor(0)
            .setDepth(Consts.Depth.HUD);

        me._state = Enums.HudState.HIDDEN;
        me.select(Config.StartPlayer);
    }

    /**
     * @param {Boolean} show 
     */
    updateVisibility(show) {
        const me = this;

        show
            ? me._show()
            : me._hide();
    }

    /**
     * @param {Number} index 
     */
    showField(index) {
        const me = this;

        const config = FieldInfo.Config[index];
        
        me._setFieldInfoVisible(true);

        switch (config.type) {
            case Enums.FieldType.PROPERTY: 
                return me._showPropertyInfo(config);

            case Enums.FieldType.UTILITY: 
                return me._showUtilityInfo(config);

            case Enums.FieldType.RAILSTATION: 
                return me._showRailStationInfo(config);

            default:
                return me._setFieldInfoVisible(false);
        }
    }

    /**
     */
    hideField() {
        const me = this;
        
        me._setFieldInfoVisible(false);
    }

    /**
     * @param {Number} player 
     * @param {Number} hand 
     * @param {Number} cards 
     */
    updateMoney(player, hand, cards) {
        const me = this;
        
        me._playerItems[player].hand.setText(hand);
        me._playerItems[player].cards.setText(cards);
        me._playerItems[player].total.setText(hand + cards);
    }
    
    /**
     * @param {Number} player 
     */
    select(player) {
        const me = this;

        const target = Utils.buildPoint(0, -352 + player * 100);

        me._factory.tween({
            targets: me._selection,
            y: target.y,
            ease: 'Sine.easeInOut',
            duration: Utils.getTweenDuration(
                Utils.toPoint(me._selection),
                target,
                Consts.Speed.HandFollow)
        });
    }

    _show() {
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

    _hide() {
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

    _setFieldInfoVisible(visible) {
        const me = this;

        me._infoItems.caption.setVisible(visible);
        me._infoItems.icon.setVisible(visible);
        me._infoItems.details.setVisible(visible);
    }

    _showPropertyInfo(config) {
        const me = this;

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
    }

    _showUtilityInfo(config) {
        const me = this;

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

        me._infoItems.details.setText(details);
    }

    _showRailStationInfo(config) {
        const me = this;

        me._infoItems.caption
            .setText(config.name);

        me._infoItems.details.setVisible(false);
    }
}