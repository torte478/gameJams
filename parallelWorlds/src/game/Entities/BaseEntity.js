export default class BaseEntity {

    /** @type {Number} */
    id;

    /** @type {Phaser.GameObjects.GameObject} */
    origin;

    /**
     * @param {Number} id
     */
    constructor(id) {
        const me = this;

        me.id = id;
    }    

    getCollider() {
        const me = this;

        return me.origin;
    }

    _initOrigin(origin) {
        const me = this;

        me.origin = origin;
        me.origin.entity = me;
    }   
}
