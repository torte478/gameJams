import Enums from "./Enums.js";

export default class Global {

    static StartPosition = {
        x: 512,
        y: 700
    };

    static Debug = true;

    static FieldUnit = 10;

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
            type: Enums.FieldType.TAX
        },
        // 5
        {
            type: Enums.FieldType.RAILSTATION
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
            type: Enums.FieldType.RAILSTATION
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
            type: Enums.FieldType.RAILSTATION
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
            type: Enums.FieldType.UTILITY
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
            name: "YESKIA",
            cost: 300,
            icon: 34
        },
    ]
}