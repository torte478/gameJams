import Phaser from '../lib/phaser.js';

export class Rectangle {
    /** @type {Phaser.Geom.Point} */
    a;

    /** @type {Phaser.Geom.Point} */
    b;

    /** @type {Phaser.Geom.Point} */
    c;

    /** @type {Phaser.Geom.Point} */
    d;

    /**
     * @param {Phaser.Geom.Point} a 
     * @param {Phaser.Geom.Point} b 
     */
    static build(a, b) {
        return new Rectangle(
            a,
            new Phaser.Geom.Point(b.x, a.y),
            b,
            new Phaser.Geom.Point(a.x, b.y));
    }

    /**
     * @param {Phaser.Geom.Point} a 
     * @param {Phaser.Geom.Point} b 
     * @param {Phaser.Geom.Point} c 
     * @param {Phaser.Geom.Point} d 
     */
     constructor(a, b, c, d) {
        const me = this;

        me.a = a;
        me.b = b;
        me.c = c;
        me.d = d;
    }

    /**
     * @returns {Array}
     */
    toPoints() {
        const me = this;

        return [
            [ me.a.x, me.a.y ], 
            [ me.b.x, me.b.y ], 
            [ me.c.x, me.c.y ], 
            [ me.d.x, me.d.y ]
        ];
    }

    /**
     * @returns {Array}
     */
    toSides() {
        const me = this;

        return [
           [me.a, me.b],
           [me.b, me.c],
           [me.c, me.d],
           [me.d, me.a]
        ];
    }
}

export class Geometry {

    /**
     * @param {Phaser.Geom.Point} a 
     * @param {Phaser.Geom.Point} b 
     * @param {Phaser.Geom.Point} c 
     */
    static area(a, b, c) {
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    }

    static intersect1(a,b, c, d) {
        if (a > b) {
            let t = a;
            a = b;
            b = t;
        }

        if (c > d) {
            let t = c;
            c = d;
            d = t;
        }

        return Math.max(a, c) <= Math.max(b, d);
    }

    /**
     * @param {Phaser.Geom.Point} a 
     * @param {Phaser.Geom.Point} b 
     * @param {Phaser.Geom.Point} c 
     * @param {Phaser.Geom.Point} d 
     */
    static isSegmentsIntersects(a, b, c, d) {
        return Geometry.intersect1(a.x, b.x, c.x, d.x)
            && Geometry.intersect1(a.y, b.y, c.y, d.y)
            && Geometry.area(a, b, c) * Geometry.area(a, b, d) <= 0
            && Geometry.area(c, d, a) * Geometry.area(c, d, b) <= 0
    }

    static isPointInsidePolygon(point, vs) {        
        var x = point[0], y = point[1];
        
        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1];
            var xj = vs[j][0], yj = vs[j][1];
            
            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        
        return inside;
    };

    /**
     * @param {Rectangle} first 
     * @param {Rectangle} second 
     */
     static isVertexInside(first, second) {
        const points = first.toPoints();

        const insideCount = second
            .toPoints()
            .filter((point) => Geometry.isPointInsidePolygon(point, points))
            .length;

        return insideCount > 0;
    }

    /**
     * @param {Rectangle} first 
     * @param {Rectangle} second 
     */
     static isRectanglesIntersects(first, second) {
        if (Geometry.isVertexInside(first, second))
            return true;

        if (Geometry.isVertexInside(second, first))
            return true;

        const firstSides = first.toSides();
        const secondSides = second.toSides();
        for (let i = 0; i < firstSides.length; ++i)
        for (let j = 0; j < secondSides.length; ++j)
        {
            if (Geometry.isSegmentsIntersects(firstSides[i][0], firstSides[i][1], secondSides[j][0], secondSides[j][1]))
                return true;
        }

        return false;
    }
}