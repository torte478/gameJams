import Phaser from '../lib/phaser.js';

import Player from './Entities/Player.js';
import Fields from './Entities/Fields.js';
import Cards from './Entities/Cards.js';
import Groups from './Entities/Groups.js'; 
import Hand from './Entities/Hand.js';
import HUD from './Entities/HUD.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Status from './Status.js';
import Utils from './Utils.js';
import Helper from './Helper.js';
import Timer from './Entities/Timer.js';
import Dice from './Entities/Dice.js';
import Piece from './Entities/Piece.js';
import AI from './Entities/AI.js';
import Context from './Entities/Context.js';
import Core from './Core.js';

export default class Start {
    static Init(scene) {

        const core = new Core(scene);

        // phaser

        scene.physics.world.setBounds(-2500, -2500, 5000, 5000);

        scene.cameras.main
            .setScroll(
                Config.Start.CameraPosition.x - Consts.Viewport.Width / 2,
                Config.Start.CameraPosition.y - Consts.Viewport.Height / 2)
            .setBounds(
                scene.physics.world.bounds.x,
                scene.physics.world.bounds.y,
                scene.physics.world.bounds.width,
                scene.physics.world.bounds.height);

        // core

        core._scene = scene;
        Start._createLevel(scene);
        core._cursor = Start._createCursor(scene);
        core._groups = new Groups(scene);
        core._cards = new Cards(scene);
        core._hud = new HUD(scene.add);
        core._turnTimer = new Timer(Config.Start.Time.TurnSec * 1000, false);
        core._lightTimer = new Timer(Config.Start.Time.LightSec * 1000, false);
        core._darkTimer = new Timer(Config.Start.Time.DarkSec * 1000, true);
        core._fade = Start._createFade(scene);

        // context

        const context = new Context();

        context.status = new Status(Config.Start.PiecePositions, Config.Start.Player, Config.Start.State);
        context.fields = new Fields(scene, Config.Start.PiecePositions);

        context.pieces = [];
        for (let player = 0; player < Config.Start.PlayerCount; ++player) {
            const position = context.fields.movePiece(player, 0, Config.Start.PiecePositions[player]);
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
        for (let i = 0; i < Config.Start.PlayerCount; ++i)
            context.hands.push(new Hand(scene, i));

        context.players = [];
        for (let i = 0; i < Config.Start.PlayerCount; ++ i) {
            const player = new Player(scene, i, Config.Start.Money, core._groups);
            context.players.push(player);
        }

        core._ai = Start._createAI(context);
        core._context = context;

        // init

        for (let i = 0; i < Config.Start.PlayerCount; ++i)
            Start._initPlayer(i, core, context);

        core._setState(Config.Start.State);

        // colliders

        scene.physics.add.collider(core._context.dice1.toGameObject(), core._context.dice2.toGameObject());

        // Debug

        if (Config.Debug.Global && Config.Debug.ShowTextLog) {
            core._log = scene.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        }

        // end

        return core;
    }

    static _createCursor(scene) {
        return scene.physics.add.image(
            Config.Start.CameraPosition.x, 
            Config.Start.CameraPosition.y, 
            'cursor')
            .setDepth(Consts.Depth.Max)
            .setVisible(false)
            .setCollideWorldBounds(true);
    }

    static _createLevel(scene) {
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
        const layer = map.createLayer(0, tiles, -2750, -2750);
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
        for (let i = 0; i < Config.Start.Fields[player].length; ++i) {
            const field = Config.Start.Fields[player][i];
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
        if (Config.Start.Fields[player].length > 0)
            core._updateRent(player);

        // hud
        core._hud.updateMoney(
            player, 
            context.players[player].getBillsMoney(),
            context.players[player].getFieldsCost());
    }
}