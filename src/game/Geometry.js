import Phaser from '../lib/phaser.js';

export class Rectangle {
    /** @type {Phaser.Math.Vector2} */
    a;

    /** @type {Phaser.Math.Vector2} */
    b;

    /** @type {Phaser.Math.Vector2} */
    c;

    /** @type {Phaser.Math.Vector2} */
    d;

    /**
     * @param {Phaser.Math.Vector2} a 
     * @param {Phaser.Math.Vector2} b 
     */
    static build(a, b) {
        return new Rectangle(
            a,
            new Phaser.Math.Vector2(b.x, a.y),
            b,
            new Phaser.Math.Vector2(a.x, b.y));
    }

    /**
     * @param {Phaser.Math.Vector2} a 
     * @param {Phaser.Math.Vector2} b 
     * @param {Phaser.Math.Vector2} c 
     * @param {Phaser.Math.Vector2} d 
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
     * @param {Phaser.Math.Vector2} a 
     * @param {Phaser.Math.Vector2} b 
     * @param {Phaser.Math.Vector2} c 
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
     * @param {Phaser.Math.Vector2} a 
     * @param {Phaser.Math.Vector2} b 
     * @param {Phaser.Math.Vector2} c 
     * @param {Phaser.Math.Vector2} d 
     */
    static isSegmentsIntersects(a, b, c, d) {
        return Geometry.intersect1(a.x, b.x, c.x, d.x)
            && Geometry.intersect1(a.y, b.y, c.y, d.y)
            && Geometry.area(a, b, c) * Geometry.area(a, b, d) <= 0
            && Geometry.area(c, d, a) * Geometry.area(c, d, b) <= 0
    }

    static inside2(point, vs) {        
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

    static isPointInside(p, N, x, y) {
        let flag = false;
        let i1, i2, S, S1, S2, S3 = 0;

        for (let n = 0; n < N; n++)
        {
            flag = false;
            i1 = n < N-1 ? n + 1 : 0;

            while (flag === false)
            {
                i2 = i1 + 1;

                if (i2 >= N)
                    i2 = 0;

                if (i2 === (n < N-1 ? n + 1 : 0))
                    break;

                S = Math.abs(
                        p[i1].x * (p[i2].y - p[n ].y) +
                        p[i2].x * (p[n ].y - p[i1].y) +
                        p[n].x  * (p[i1].y - p[i2].y));
                S1 = Math.abs(
                        p[i1].x * (p[i2].y - y) +
                        p[i2].x * (y       - p[i1].y) +
                        x       * (p[i1].y - p[i2].y));
                S2 = Math.abs(
                        p[n ].x * (p[i2].y - y) +
                        p[i2].x * (y       - p[n ].y) +
                        x       * (p[n ].y - p[i2].y));
                S3 = Math.abs(
                        p[i1].x * (p[n ].y - y) +
                        p[n ].x * (y       - p[i1].y) +
                        x       * (p[i1].y - p[n ].y));

                if (S === S1 + S2 + S3)
                {
                    flag = true;
                    break;
                }

                i1 = i1 + 1;

                if (i1 >= N)
                    i1 = 0;

                break;
            }

            if (flag === false)
                break;
        }

        return flag;
    }

    /**
     * @param {Rectangle} first 
     * @param {Rectangle} second 
     */
     static isVertexInside(first, second) {
        const points = first.toPoints();
        const size = first.length;

        const insideCount = second
            .toPoints()
            .filter((point) => Geometry.inside2(point, points)) // (points, size, point.x, point.y))
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