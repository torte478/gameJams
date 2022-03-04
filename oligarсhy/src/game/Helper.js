import Consts from "./Consts.js";
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
     * @param {Number[]} money 
     * @param {Number} value 
     */
     static getOptimalBills(money, value) {

        if (Helper.getTotalMoney(money) < value)
            throw `not enough money for pay ${value}`;

        const result = Utils.buildArray(Consts.BillCount, 0);

        const temp = [];
        for (let i = 0; i < money.length; ++i)
            temp.push(money[i]);

        let i = result.length - 1;
        while (value > 0 && i >= 0) {

            while (temp[i] == 0)
                --i;

            ++result[i];
            --temp[i];
            value -= Consts.BillValue[i];
        }

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
     * @param {Number[]} money 
     * @returns {Number[]}
     */
    static splitBillToBills(money) {
        let totalCount = 0;
        money.forEach((x) => totalCount += x);
        if (totalCount != 1)
            throw `can't split money array. wrong bill count`;

        let billIndex = Consts.BillCount - 1;
        while (money[billIndex] == 0)
            --billIndex;

        if (billIndex == 0)
            throw `can't split min bill`;

        const amount = Consts.BillValue[billIndex] - Consts.BillValue[billIndex - 1];
        const result = Helper.splitValueToBills(amount);
        result[billIndex - 1]++;
        
        return result;
    }

    /**
     * @param {Number[]} money 
     * @returns {Number[]}
     */
    static mergeBills(money) {
        const total = Helper.getTotalMoney(money);
        
        if (total == 0)
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
     * 
     * @param {Number} side 
     * @returns {Phaser.Geom.Point}
     */
    static getOuterPos(side) {

        return Helper.rotate(
            Utils.buildPoint(0, -3000),
            side);
    }

    /**
     * 
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
}