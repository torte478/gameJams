import InteriorComponent from "./InteriorComponent.js";
import MoneyComponent from "./MoneyComponent.js";
import RoadComponent from "./RoadComponent.js";

export default class {

    /** @type {RoadComponent} */
    road;

    /** @type {InteriorComponent} */
    interior;

    /** @type {MoneyComponent} */
    money;

    update(delta) {
        const me = this;

        me.road.update(delta);
        me.interior.update(delta);
        me.money.update(delta);
    }
}