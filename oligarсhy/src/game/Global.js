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
        }
    ]
}