import Enums from "./Enums.js";

// TODO: why? (Global ->? Config)
export default class Global {

    static StartPosition = {
        x: 200,
        y: 200
    };

    static StartIndicies = [
        0
    ];

    static Debug = true;

    static FieldCount = 40;

    // TODO : replace
    static Fields = [
        // 0
        {
            type: Enums.FieldType.START
        },
        // 1
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.BROWN,
            name: 'iOSS',
            cost: 60,
            icon: 0
        },
        // 2
        {
            type: Enums.FieldType.CHANCE
        },
        // 3
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.BROWN,
            name: 'CYBORG',
            cost: 60,
            icon: 2
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
            cost: 200
        },
        // 6
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.LIGHTBLUE,
            name: 'BWM',
            cost: 100,
            icon: 4
        },
        // 7
        {
            type: Enums.FieldType.CHANCE
        },
        // 8
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.LIGHTBLUE,
            name: 'MERCYDEATH',
            cost: 100,
            icon: 6
        },
        // 9
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.LIGHTBLUE,
            name: 'OOOOUDI',
            cost: 120,
            icon: 8
        },
        //10
        {
            type: Enums.FieldType.JAIL
        },
        //11
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.PURPLE,
            name: 'LC',
            cost: 140,
            icon: 10
        },
        //12
        {
            type: Enums.FieldType.UTILITY,
            name: 'ELECTRICITY',
            cost: 150,
            icon: 6
        },
        //13
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.PURPLE,
            name: 'SAMMOONG',
            cost: 140,
            icon: 12
        },
        //14
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.PURPLE,
            name: 'MIKEA',
            cost: 160,
            icon: 14
        },
        //15
        {
            type: Enums.FieldType.RAILSTATION,
            name: 'LONDON',
            cost: 200
        },
        //16
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.ORANGE,
            name: 'INSTAPOUND',
            cost: 180,
            icon: 16
        },
        //17
        {
            type: Enums.FieldType.CHANCE
        },
        //18
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.ORANGE,
            name: 'WETUBE',
            cost: 180,
            icon: 18
        },
        //19
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.ORANGE,
            name: 'HONKER',
            cost: 200,
            icon: 20
        },
        //20
        {
            type: Enums.FieldType.FREE
        },
        //21
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.RED,
            name: 'BURGER QUEEN',
            cost: 220,
            icon: 22
        },
        //22
        {
            type: Enums.FieldType.CHANCE
        },
        //23
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.RED,
            name: 'SUBPATH',
            cost: 220,
            icon: 24
        },
        //24
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.RED,
            name: "DONMACLD'S",
            cost: 240,
            icon: 26
        },
        //25
        {
            type: Enums.FieldType.RAILSTATION,
            name: 'PARIS',
            cost: 200
        },
        //26
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.YELLOW,
            name: "SIEWOMANS",
            cost: 260,
            icon: 28
        },
        //27
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.YELLOW,
            name: "AUTOROLA",
            cost: 260,
            icon: 30
        },
        //28
        {
            type: Enums.FieldType.UTILITY,
            name: 'WATER',
            cost: 150,
            icon: 8
        },
        //29
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.YELLOW,
            name: "YESKIA",
            cost: 280,
            icon: 32
        },
        //30
        {
            type: Enums.FieldType.GOTOJAIL,
        },
        //31
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.GREEN,
            name: "NINELEVENDO",
            cost: 300,
            icon: 34
        },
        //32
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.GREEN,
            name: "XSPHERE",
            cost: 300,
            icon: 36
        },
        //33
        {
            type: Enums.FieldType.CHANCE,
        },
        //34
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.GREEN,
            name: "STOPSTATION",
            cost: 320,
            icon: 38
        },
        //35
        {
            type: Enums.FieldType.RAILSTATION,
            name: 'ISTANBUL',
            cost: 200
        },
        //36
        {
            type: Enums.FieldType.CHANCE
        },
        //37
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.BLUE,
            name: "LC COMICS",
            cost: 350,
            icon: 40
        },
        //38
        {
            type: Enums.FieldType.TAX,
            cost: 100
        },
        //39
        {
            type: Enums.FieldType.PROPERTY,
            color: Enums.FieldColor.BLUE,
            name: "MALVER",
            cost: 400,
            icon: 42
        }
    ]
}