import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Utils from "./Utils.js";

export default class Helper {

    /**
     * @param {Number} side 
     * @param {Boolean} vertical
     * @returns {Number}
     */
    static getAngle(side, vertical) {

        const index = vertical
            ? side + 1
            : side;

        switch (index % 4) {
            case 0:
                return 0;

            case 1:
                return 90;

            case 2:
                return 180;

            case 3: 
                return 270;

            default:
                throw `can't calculate angle for side ${side}`;
        }
    }

    /**
     * @param {Number[]} money 
     * @return {Number}
     */
     static getTotalMoney(money) {
        let result = 0;

        for (let i = 0; i < money.length; ++i)
            result += money[i] * Consts.BillValue[i];

        return result;
    }

    /**
     * @param {Number} value 
     * @returns {Number[]}
     */
     static splitValueToBills(value) {
        const result = Utils.buildArray(Consts.BillCount, 0);

        let i = result.length - 1;
        while (value > 0) {

            while (value < Consts.BillValue[i])
                --i;

            ++result[i];
            value -= Consts.BillValue[i];
        }

        return result;
    }

    /**
     * @param {Number[]} bills 
     * @returns {Number[]}
     */
    static splitBillToMany(bills) {
        let totalCount = 0;
        bills.forEach((x) => totalCount += x);
        if (totalCount != 1)
                throw `can't split bill. bill count != 1`;

        let index = Consts.BillCount - 1;
        while (bills[index] === 0)
            --index;

        if (index === 0)
            throw `can't split min bill`;

        const amount = Consts.BillValue[index] - Consts.BillValue[index - 1];
        const result = Helper.splitValueToBills(amount);
        result[index - 1]++;
        
        return result;
    }

    /**
     * @param {Number[]} bills 
     * @param {Number} action 
     * @returns {Number[]}
     */
     static manageBills(bills, action) {
        if (action == Enums.ActionType.MERGE_MONEY)
            return Helper.mergeBills(bills);
        else if (action == Enums.ActionType.SPLIT_MONEY)
            return Helper.splitBillToMany(bills);
        else 
            throw `Unknown money management type ${Utils.enumToString(Enums.ActionType, action)}`;
    }

    /**
     * @param {Number[]} money 
     * @returns {Number[]}
     */
    static mergeBills(money) {
        const total = Helper.getTotalMoney(money);
        
        if (total === 0)
            throw `can't merge zero money`;

        return Helper.splitValueToBills(total);
    }

    /**
     * @param {Number} index 
     * @returns {Number}
     */
    static getFieldAngle(index) {
        const quotient = index / (Consts.FieldCount / 4);
        const angle = Helper.getAngle(Math.floor(quotient));
        return angle;
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Number} side 
     * @returns {Phaser.Geom.Point}
     */
    static rotate(point, side) {
        const angle = Helper.getAngle(side);

        return Phaser.Math.RotateAround(
            point,
            0,
            0,
            Phaser.Math.DegToRad(angle)
        );
    }

    /**
     * [2, 1, 3] => [0, 1, 2, 0, 2, 2]
     * @param {Number[]} money 
     * @returns {Number[]}
     */
    static enumBills(money) {
        const result = [];
        let iteration = 1;
        while (true) {
            let added = false;
            for (let i = 0; i < money.length; ++i)
                if (money[i] >= iteration) {
                    added = true;
                    result.push(i);
                }

            if (added)
                ++iteration;
            else
                break;
        }

        return result;
    }

    /**
     * @param {Phaser.GameObjects.Image} image 
     */
    static toDark(image) {
        image.setFrame(image.frame.name + 1);
    }

    /**
     * @param {Phaser.GameObjects.Image} image 
     */
    static toLight(image) {
        image.setFrame(image.frame.name - 1);
    }
}