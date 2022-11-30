import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
import Graphics from '../Graphics.js';
import Reserve from '../Reserve.js';
import Status from '../Status.js';
import Audio from '../utils/Audio.js';
import Utils from '../utils/Utils.js';
import Citizen from './Citizen.js';
import CitizenPool from './CitizenPool.js';

export default class City {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {CitizenPool} */
    _citizenPool;

    /** @type {Reserve} */
    _reserve;

    /** @type {Status} */
    _status;

    /** @type {Phaser.Geom.Point} */
    _cemetryPos;

    /** @type {Boolean[][]} */
    _cemetry;

    /** @type {Graphics} */
    _graphics;

    /** @type {Audio} */
    _audio;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Status} status
     * @param {Reserve} reserve
     * @param {Graphics} graphics
     */
    constructor(scene, status, reserve, graphics, audio, transfer) {
        const me = this;

        me._scene = scene;
        me._reserve = reserve;
        me._status = status;
        me._graphics = graphics;
        me._audio = audio;
        me._transfer = transfer;

        me._needTutorial = me._status.level == Consts.FirstLevel;

        scene.add.image(-Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'city_background')
            .setDepth(Consts.Depth.Background);

        scene.physics.world.setBounds(
            Consts.Citizen.LeftX,
            0,
            Consts.Citizen.RightX - Consts.Citizen.LeftX,
            Consts.Viewport.Height);

        scene.physics.world.on('worldbounds', me._onWorldBounds);

        me._citizenPool = new CitizenPool(scene, status, me._onCitizenClick, me);

        me._reserve.emitter.on('coffinClick', me._onReserveClick, me);

        me._cemetryPos = Utils.buildPoint(-900, 540);
        const width = Math.floor((-100 - (-900)) / Consts.Unit);
        const height = Math.floor((768 - 540) / Consts.Unit);

        me._cemetry = [];
        for (let i = 0; i < height; ++i) {
            const row = [];
            for (let j = 0; j < width; ++j)
                row.push(false);
            me._cemetry.push(row);
        }

        scene.add.image(60 - Consts.Viewport.Width, 40, 'mine_hud', 1).setDepth(Consts.Depth.UI);
        me._hud = scene.add.text(70 - Consts.Viewport.Width, 40, me._status.avaialbeCitizens, { fontFamily: "Arial Black", fontSize: 24, color: '#6a7798' })
            .setOrigin(0, 0.5)
            .setDepth(Consts.Depth.UI);
    }

    resume() {
        const me = this;

        const count = Math.min(me._status.avaialbeCitizens, Consts.Citizen.MaxCountPerScreen);
        for (let i = 0; i < count; ++i) {
            const position = Utils.buildPoint(
                Utils.getRandom(Consts.Citizen.LeftX, Consts.Citizen.RightX),
                Utils.getRandom(Consts.Citizen.UpY, Consts.Citizen.DownY));

            me._citizenPool.spawn(position, me._status.level);
        }

        if (me._needTutorial) {
            me._needTutorial = false;

            const tutorial = me._scene.add.text(
                -Consts.Viewport.Width / 2, 
                600, 
                'Click on people',
                { fontFamily: "Arial Black", fontSize: 24, color: '#e3f0ff' })
                .setDepth(Consts.Depth.UI)
                .setOrigin(0.5)
                .setShadow(2, 2, '#333333', 2);

            me._scene.time.delayedCall(5000, () => tutorial.setVisible(false));
        }
    }

    pause() {
        const me = this;

        me._citizenPool.destroyAll();
    }

    _onCitizenClick(citizen) {
        const me = this;

        if (me._status.isBusy)
            return;

        if (!me._reserve.hasEmptyPlace())
            return;

        me._status.busy();
        citizen.disableBody();
        me._audio.play('action_start');
        me._reserve.addSoldier(citizen, me._onSoldierAdd, me);
    }

    _onSoldierAdd(citizen) {
        const me = this;

        me._citizenPool.killAndHide(citizen);
        me._status.avaialbeCitizens -= 1;
        me._hud.setText(me._status.avaialbeCitizens);
        me._audio.play('action_end');

        if (!me._reserve.hasEmptyPlace() || me._citizenPool._pool.getChildren().length == 0) {
            me._scene.add.tween({
                targets: me._transfer._button,
                scale: { from: 1, to: 2 },
                yoyo: true,
                duration: 500,
                onComplete: () => me._transfer._button.setScale(1),
            });
        }

        me._status.free();
    }

    _onWorldBounds(body) {
        /** @type {Phaser.Physics.Arcade.Sprite} */
        const sprite = body.gameObject;

        sprite.setFlipX(!sprite.flipX);
    }

    _onReserveClick() {
        const me = this;

        if (me._status.isBusy || !me._status.isCity)
            return;

        me._status.busy();

        me._audio.play('action_start');

        const available = [];
        for (let i = 0; i < me._cemetry.length; ++i)
            for (let j = 0; j < me._cemetry[i].length; ++j)
                if (!me._cemetry[i][j])
                    available.push({i: i, j: j});

        const index = Utils.getRandomEl(available);

        const position = me._reserve.removeCoffin();
        const coffin = me._graphics.createCoffin(position);
        const target = Utils.buildPoint(
            me._cemetryPos.x + index.j * Consts.Unit,
            me._cemetryPos.y + index.i * Consts.Unit);

        me._scene.add.tween({
            targets: coffin,
            x: target.x,
            y: target.y,
            ease: 'Sine.easeInOut',
            duration: Consts.Speed.Reserve,
            onComplete: () => {
                me._graphics.createGrave(target);
                me._graphics.killAndHide(coffin);
                me._cemetry[index.i][index.j] = true;

                me._audio.play('action_end');
                me._reserve.updateHud(0);
                me._status.free();
            }
        })
    }
}