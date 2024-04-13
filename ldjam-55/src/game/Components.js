import InteriorComponent from "./InteriorComponent.js";
import RoadComponent from "./RoadComponent.js";

export default class {

    /** @type {RoadComponent} */
    road;

    /** @type {InteriorComponent} */
    interior;

    update(delta) {
        const me = this;

        me.road.update(delta);
        me.interior.update(delta);
    }
}