import Phaser from '../lib/phaser.js';

import AI from './Entities/AI.js';
import Cards from './Entities/Cards.js';
import Context from './Entities/Context.js';
import Dice from './Entities/Dice.js';
import Fields from './Entities/Fields.js';
import Hand from './Entities/Hand.js';
import HUD from './Entities/HUD.js';
import Piece from './Entities/Piece.js';
import Player from './Entities/Player.js';
import Timer from './Entities/Timer.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Core from './Core.js';
import Status from './Status.js';
import Utils from './Utils.js';
import BillPool from './Entities/BillPool';
import HousePool from './Entities/HousePool.js';

export default class CompositionRoot {

    /**
     * @param {Phaser.Scene} scene 
     * @returns {Core}
     */
    static init(scene) {

        const core = new Core(scene);

        // phaser

        scene.physics.world.setBounds(-2500, -2500, 5000, 5000);

        scene.cameras.main
            .setScroll(
                Config.CameraPosition.x - Consts.Viewport.Width / 2,
                Config.CameraPosition.y - Consts.Viewport.Height / 2)
            .setBounds(
                scene.physics.world.bounds.x,
                scene.physics.world.bounds.y,
                scene.physics.world.bounds.width,
                scene.physics.world.bounds.height);

        CompositionRoot._createTiles(scene);

        // core
        core._scene = scene;
        core._cursor = CompositionRoot._createCursor(scene);
        core._billPool = new BillPool(scene);
        core._cards = new Cards(scene);
        core._hud = new HUD(scene.add);

        core._timers = [
            new Timer(Config.Time.TurnSec * 1000, false),
            new Timer(Config.Time.LightSec * 1000, false),
            new Timer(Config.Time.DarkSec * 1000, true)
        ];

        core._fade = CompositionRoot._createFade(scene);

        // context

        const context = new Context();

        context.status = new Status(Config.StartPiecePositions, Config.StartPlayer);
        context.fields = new Fields(scene, Config.StartPiecePositions);

        context.pieces = [];
        for (let player = 0; player < Config.PlayerCount; ++player) {
            const position = context.fields.movePiece(player, 0, Config.StartPiecePositions[player]);
            const piece = new Piece(scene, position.x, position.y, player);
            context.pieces.push(piece);
        }

        context.dice1 = new Dice(scene, 0, 0, 2);

        context.dice2 = new Dice(
            scene,
            Consts.SecondDiceOffset.X, 
            Consts.SecondDiceOffset.Y,
            6);

        context.hands = [];
        for (let i = 0; i < Config.PlayerCount; ++i)
            context.hands.push(new Hand(scene, i));

        const housePool = new HousePool(scene);
        context.players = [];
        for (let i = 0; i < Config.PlayerCount; ++ i) {
            const player = new Player(scene, i, Config.Money, housePool);
            context.players.push(player);
        }

        core._ai = CompositionRoot._createAI(context);
        core._context = context;

        // init

        for (let i = 0; i < Config.PlayerCount; ++i)
            CompositionRoot._initPlayer(i, core, context);

        core._setState(Config.StartState);

        // colliders

        scene.physics.add.collider(
            core._context.dice1.toGameObject(), 
            core._context.dice2.toGameObject());

        // Debug

        if (Utils.isDebug(Config.Debug.ShowTextLog)) {
            core._log = scene.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        }

        // end

        return core;
    }

    static _createCursor(scene) {
        return scene.physics.add.image(
            Config.CameraPosition.x, 
            Config.CameraPosition.y, 
            'cursor')
            .setDepth(Consts.Depth.Max)
            .setVisible(false)
            .setCollideWorldBounds(true);
    }

    static _createTiles(scene) {
        const level = [
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        ];

        const map = scene.make.tilemap({ data: level, tileWidth: 500, tileHeight: 500 });
        const tiles = map.addTilesetImage('table');
        map.createLayer(0, tiles, -2750, -2750);
    }

    static _createFade(scene) {
        return scene.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'fade')
            .setScrollFactor(0)
            .setDepth(Consts.Depth.Fade)
            .setAlpha(0.75)
            .setVisible(false);
    }

    static _createAI(context) {
        const ai = [ null ];
        for (let i = 1; i < context.players.length; ++i) {
            const player = new AI(i, context);
            ai.push(player);
        }

        return ai;
    }

    static _initPlayer(player, core, context) {
        // start fields
        for (let i = 0; i < Config.Fields[player].length; ++i) {
            const field = Config.Fields[player][i];
            const index = isNaN(field) ? field.index : index;
            core._buyField(index, player, true);

            if (!isNaN(field))
                continue;

            for (let j = 0; j < field.houses; ++j)
                context.players[player].addHouse(
                    index, 
                    context.fields.getFieldPosition(index));
        }

        //start rent
        if (Config.Fields[player].length > 0)
            core._updateRent(player);

        // hud
        core._hud.updateMoney(
            player, 
            context.players[player].getBillsMoney(),
            context.players[player].getFieldsCost());
    }
}