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
            name: 'iOSs',
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
            name: 'Cyborg',
            cost: 60,
            icon: 2
        }
    ]
}