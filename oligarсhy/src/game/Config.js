import Enums from "./Enums.js";

export default class Config {

    static Debug = true;
    
    static DebugStateLog = true;
    static DebugLog = true;

    static PlayerCount = 2;

    static Start = {
        CameraPosition: {
            x: 800,
            y: 600
        },

        PlayerCount: 2,

        PiecePositions: [
            1,
            0,
            1,
            2
        ],

        Player: 0,

        State: Enums.GameState.PIECE_ON_FREE_PROPERTY,

        Money: [
            5,
            1,
            2,
            1,
            1,
            4,
            2
        ]
    }

    static Fields = [
        // 0
        {
            type: Enums.FieldType.START
        },
        // 1
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.BROWN,
            name: 'iOSS',
            icon: 0,
            cost: 60,
            costHouse: 50,
            rent: [
                2,
                4,
                10,
                30,
                90,
                160,
                250
            ]
        },
        // 2
        {
            type: Enums.FieldType.CHANCE
        },
        // 3
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.BROWN,
            name: 'CYBORG',
            cost: 60,
            icon: 2,
            cost: 60,
            costHouse: 50,
            rent: [
                4,
                8,
                20,
                60,
                180,
                320,
                450
            ]
        },
        // 4
        {
            type: Enums.FieldType.TAX,
            cost: 200
        },
        // 5
        {
            type: Enums.FieldType.RAILSTATION,
            name: 'MOSCOW',
            cost: 200,
            rent: [
                25,
                50,
                100,
                200
            ]
        },
        // 6
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.LIGHTBLUE,
            name: 'BWM',
            icon: 4,
            cost: 100,
            costHouse: 50,
            rent: [
                6,
                12,
                30,
                90,
                270,
                400,
                550
            ]
        },
        // 7
        {
            type: Enums.FieldType.CHANCE
        },
        // 8
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.LIGHTBLUE,
            name: 'MERCYDEATH',
            icon: 6,
            cost: 100,
            costHouse: 50,
            rent: [
                6,
                12,
                30,
                90,
                270,
                400,
                550
            ]
        },
        // 9
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.LIGHTBLUE,
            name: 'OOOOUDI',
            icon: 8,
            cost: 100,
            costHouse: 50,
            rent: [
                8,
                16,
                40,
                100,
                300,
                450,
                600
            ]

        },
        //10
        {
            type: Enums.FieldType.JAIL
        },
        //11
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.PURPLE,
            name: 'LC',
            icon: 10,
            cost: 140,
            costHouse: 100,
            rent: [
                10,
                20,
                50,
                150,
                450,
                625,
                750
            ]
        },
        //12
        {
            type: Enums.FieldType.UTILITY,
            name: 'ELECTRICITY',
            icon: 6,
            cost: 150,
            rent: [
                4,
                10
            ]
        },
        //13
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.PURPLE,
            name: 'SAMMOONG',
            icon: 12,
            cost: 140,
            costHouse: 100,
            rent: [
                10,
                20,
                50,
                150,
                450,
                625,
                750
            ]
        },
        //14
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.PURPLE,
            name: 'MIKEA',
            icon: 14,
            cost: 160,
            costHouse: 100,
            rent: [
                12,
                24,
                60,
                180,
                500,
                700,
                900
            ]
        },
        //15
        {
            type: Enums.FieldType.RAILSTATION,
            name: 'LONDON',
            cost: 200,
            rent: [
                25,
                50,
                100,
                200
            ]
        },
        //16
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.ORANGE,
            name: 'INSTAPOUND',
            icon: 16,
            cost: 180,
            costHouse: 100,
            rent: [
                14,
                28,
                70,
                200,
                550,
                750,
                950
            ]
        },
        //17
        {
            type: Enums.FieldType.CHANCE
        },
        //18
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.ORANGE,
            name: 'WETUBE',
            icon: 18,
            cost: 180,
            costHouse: 100,
            rent: [
                14,
                28,
                70,
                200,
                550,
                750,
                950
            ]
        },
        //19
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.ORANGE,
            name: 'HONKER',
            icon: 20,
            cost: 200,
            costHouse: 100,
            rent: [
                16,
                32,
                80,
                220,
                600,
                800,
                1000
            ]
        },
        //20
        {
            type: Enums.FieldType.FREE
        },
        //21
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.RED,
            name: 'BURGER QUEEN',
            icon: 22,
            cost: 220,
            costHouse: 150,
            rent: [
                18,
                36,
                90,
                250,
                700,
                875,
                1050
            ]
        },
        //22
        {
            type: Enums.FieldType.CHANCE
        },
        //23
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.RED,
            name: 'SUBPATH',
            icon: 24,
            cost: 220,
            costHouse: 150,
            rent: [
                18,
                36,
                90,
                250,
                700,
                875,
                1050
            ]
        },
        //24
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.RED,
            name: "DONMACLD'S",
            icon: 26,
            cost: 240,
            costHouse: 150,
            rent: [
                20,
                40,
                100,
                300,
                750,
                925,
                1100
            ]
        },
        //25
        {
            type: Enums.FieldType.RAILSTATION,
            name: 'PARIS',
            cost: 200,
            rent: [
                25,
                50,
                100,
                200
            ]
        },
        //26
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.YELLOW,
            name: "SIEWOMANS",
            icon: 28,
            cost: 260,
            costHouse: 150,
            rent: [
                22,
                44,
                110,
                330,
                800,
                975,
                1150
            ]
        },
        //27
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.YELLOW,
            name: "AUTOROLA",
            icon: 30,
            cost: 260,
            costHouse: 150,
            rent: [
                22,
                44,
                110,
                330,
                800,
                975,
                1150
            ]
        },
        //28
        {
            type: Enums.FieldType.UTILITY,
            name: 'WATER',
            icon: 8,
            cost: 150,
            rent: [
                4,
                10
            ]
        },
        //29
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.YELLOW,
            name: "YESKIA",
            icon: 32,
            cost: 280,
            costHouse: 150,
            rent: [
                24,
                48,
                120,
                360,
                850,
                1025,
                1200
            ]
        },
        //30
        {
            type: Enums.FieldType.GOTOJAIL,
        },
        //31
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.GREEN,
            name: "NINELEVENDO",
            icon: 34,
            cost: 300,
            costHouse: 200,
            rent: [
                26,
                52,
                130,
                390,
                900,
                1100,
                1275
            ]
        },
        //32
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.GREEN,
            name: "XSPHERE",
            icon: 36,
            cost: 300,
            costHouse: 200,
            rent: [
                26,
                52,
                130,
                390,
                900,
                1100,
                1275
            ]
        },
        //33
        {
            type: Enums.FieldType.CHANCE,
        },
        //34
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.GREEN,
            name: "STOPSTATION",
            icon: 38,
            cost: 320,
            costHouse: 200,
            rent: [
                28,
                56,
                150,
                390,
                900,
                1200,
                1400
            ]
        },
        //35
        {
            type: Enums.FieldType.RAILSTATION,
            name: 'ISTANBUL',
            cost: 200,
            rent: [
                25,
                50,
                100,
                200
            ]
        },
        //36
        {
            type: Enums.FieldType.CHANCE
        },
        //37
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.BLUE,
            name: "LC COMICS",
            icon: 40,
            cost: 350,
            costHouse: 200,
            rent: [
                35,
                70,
                175,
                500,
                1100,
                1300,
                1500
            ]
        },
        //38
        {
            type: Enums.FieldType.TAX,
            cost: 100
        },
        //39
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColorIndex.BLUE,
            name: "MALVER",
            icon: 42,
            cost: 400,
            costHouse: 200,
            rent: [
                50,
                100,
                200,
                600,
                1400,
                1700,
                2000
            ]
        }
    ]
}