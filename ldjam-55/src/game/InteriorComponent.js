import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Components from './Components.js';
import Enums from './Enums.js';
import Node from './Node.js';

export default class InteriorComponent {
    
    consts = {
        pos: Utils.buildPoint(2025, 20),
        doorIndex: 18,
        speed: 100,
    }

    state = {
        isActive: false,
        delta: 0,
    }

    /** @type {Components} */
    _components;

    _center = Utils.buildPoint(2180, 300);

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    _camera;

    /** @type {Phaser.Tweens.Tween} */
    _resizeTween;

    /** @type {Phaser.Events.EventEmitter} */
    _events;

    /** @type {Phaser.GameObjects.Group} */
    _spritePool;

    constructor(events) {
        const me = this;

        me._events = events;
        me._spritePool = Here._.add.group();

        me._camera = Here._.cameras.add(800, 210, 200, 600)
            .setBackgroundColor('#9badb7')
            .setZoom(0.5)
            .setRoundPixels(false);

        Here._.add.image(me._center.x, me._center.y, 'busInterior');
        me._camera.centerOn(me._center.x, me._center.y);

        me._buildGraph();
        
        me._events.on('passengerIn', me._onPassengerIn, me);
    }

    update(delta) {
        const me = this;

        me.state.delta = delta;

        me._checkActivation();
    }

    isDoorFree() {
        const me = this;

        return !me._graph[me.consts.doorIndex].passenger;
    }

    _checkActivation() {
        const me = this;

        const isActive = Phaser.Geom.Rectangle.Contains(
            new Phaser.Geom.Rectangle(me._camera.x, me._camera.y, me._camera.width, me._camera.height),
            Here._.input.activePointer.x,
            Here._.input.activePointer.y);

        if (me.state.isActive != isActive) {

            if (!!me._resizeTween) 
                me._resizeTween.stop();
                
            const targetX = isActive ? 600 : 800;
            const targetWidth = isActive ? 400 : 200;
            const targetZoom = isActive ? 1 : 0.5;

            const percentage = Math.abs(me._camera.x - targetX) / 200

            me._resizeTween = Here._.add.tween({
                targets: me._camera,
                x: targetX,
                width: targetWidth,
                zoom: targetZoom,
                duration: 1000 * percentage,
                ease: 'Sine.easeOut',
                onUpdate: () => me._camera.centerOn(me._center.x, me._center.y)
            });

            me._events.emit('componentActivated', Enums.Components.INTERIOR, isActive, percentage);
        }

        me.state.isActive = isActive;
    }

    _onPassengerIn() {
        const me = this;

        const pos = me._toWorldPosition(me.consts.doorIndex);
        const passenger = me._spritePool.create(pos.x, pos.y, 'passengerInside');
        me._graph[me.consts.doorIndex].passenger = passenger;

        const freeNode = me._findFreeNode();
        const path = me._findPath(me.consts.doorIndex, freeNode);

        console.log(path);
    }

    _toWorldPosition(index) {
        const me = this;

        const node = me._graph[index];

        return Utils.buildPoint(
            me.consts.pos.x + (node.cell % 4) * 80 + node.x * 40 + 20,
            me.consts.pos.y + (node.cell / 4) * 80 + node.y * 40 + 20,
        );
    }

    _findFreeNode() {
        const me = this;

        return 0;

        const freeSpaces = [];
        for (let i = 0; i < me._graph.length; ++i) {
            if (i != me.consts.doorIndex && !me._graph[i].passenger)
                freeSpaces.push(i);
        }

        if (freeSpaces.length == 0)
            throw 'no free space';
        
        return Utils.getRandomEl(freeSpaces);
    }

    /**
     * @param {Number} start 
     * @param {Number} end 
     * @returns {Number[]}
     */
    _findPath(start, end) {
        const me = this;

        const distances = {};
        const previous = {};
        const nodes = Object.keys(me._graph);
        const queue = [...nodes];
    
        for (let node of nodes) {
            distances[node] = node == start ? 0 : Infinity;
            previous[node] = null;
        }
    
        while (queue.length > 0) {
            queue.sort((a, b) => distances[a] - distances[b]);
            const currentNode = queue.shift();
            
            if (currentNode == end) {
                const path = [];
                let current = end;
                while (current != null) {
                    path.unshift(current);
                    current = previous[current];
                }

                if (path.length == 0)
                    throw `can't find path from ${start} to ${end}`;

                return path.map(x => Number(x));
            }
    
            for (let i = 0; i < me._graph[currentNode].paths.length; ++i) {
                const neighbor = me._graph[currentNode].paths[i];
                const totalDistance = distances[currentNode] + 1; // TODO ?
                if (totalDistance < distances[neighbor]) {
                    distances[neighbor] = totalDistance;
                    previous[neighbor] = currentNode;
                }
            }
        }
    }

    _buildGraph() {
        const me = this;

        for (let i = 0; i <= 72; ++i)
            me._graph.push(new Node());

        for (let i = 0; i < me._graphInput.length; ++i) {
            const from = me._graphInput[i][0];
            const to = me._graphInput[i][1];
            me._graph[from].paths.push(to);
            me._graph[to].paths.push(from);
        }

        me._graph[0].x =  +0; me._graph[0].y =  -1; me._graph[0].cell = 2;
        me._graph[1].x =  +0; me._graph[1].y =  +1; me._graph[1].cell = 2;
        me._graph[2].x =  +0; me._graph[2].y =  -1; me._graph[2].cell = 3;
        me._graph[3].x =  +0; me._graph[3].y =  +1; me._graph[3].cell = 3;
        me._graph[4].x =  -1; me._graph[4].y =  -1; me._graph[4].cell = 4;
        me._graph[5].x =  +1; me._graph[5].y =  -1; me._graph[5].cell = 4;
        me._graph[6].x =  -1; me._graph[6].y =  +1; me._graph[6].cell = 4;
        me._graph[7].x =  +1; me._graph[7].y =  +1; me._graph[7].cell = 4;
        me._graph[8].x =  -1; me._graph[8].y =  -1; me._graph[8].cell = 5;
        me._graph[9].x =  +1; me._graph[9].y =  -1; me._graph[9].cell = 5;
        me._graph[10].x = -1; me._graph[10].y = +1; me._graph[10].cell = 5;
        me._graph[11].x = +1; me._graph[11].y = +1; me._graph[11].cell = 5;
        me._graph[12].x = -1; me._graph[12].y = -1; me._graph[12].cell = 6;
        me._graph[13].x = +1; me._graph[13].y = -1; me._graph[13].cell = 6;
        me._graph[14].x = -1; me._graph[14].y = +1; me._graph[14].cell = 6;
        me._graph[15].x = +1; me._graph[15].y = +1; me._graph[15].cell = 6;
        me._graph[16].x = -1; me._graph[16].y = -1; me._graph[16].cell = 7;
        me._graph[17].x = -1; me._graph[17].y = +1; me._graph[17].cell = 7;
        me._graph[18].x = +1; me._graph[18].y = +0; me._graph[18].cell = 7;
        me._graph[19].x = -1; me._graph[19].y = -1; me._graph[19].cell = 8;
        me._graph[20].x = +1; me._graph[20].y = -1; me._graph[20].cell = 8;
        me._graph[21].x = -1; me._graph[21].y = +1; me._graph[21].cell = 8;
        me._graph[22].x = +1; me._graph[22].y = +1; me._graph[22].cell = 8;
        me._graph[23].x = -1; me._graph[23].y = -1; me._graph[23].cell = 9;
        me._graph[24].x = +1; me._graph[24].y = -1; me._graph[24].cell = 9;
        me._graph[25].x = -1; me._graph[25].y = +1; me._graph[25].cell = 9;
        me._graph[26].x = +1; me._graph[26].y = +1; me._graph[26].cell = 9;
        me._graph[27].x = -1; me._graph[27].y = -1; me._graph[27].cell = 10;
        me._graph[28].x = +1; me._graph[28].y = -1; me._graph[28].cell = 10;
        me._graph[29].x = -1; me._graph[29].y = +1; me._graph[29].cell = 10;
        me._graph[30].x = +1; me._graph[30].y = +1; me._graph[30].cell = 10;
        me._graph[31].x = +0; me._graph[31].y = -1; me._graph[31].cell = 11;
        me._graph[32].x = +0; me._graph[32].y = +1; me._graph[32].cell = 11;
        me._graph[33].x = +0; me._graph[33].y = -1; me._graph[33].cell = 12;
        me._graph[34].x = +0; me._graph[34].y = +1; me._graph[34].cell = 12;
        me._graph[35].x = +0; me._graph[35].y = -1; me._graph[35].cell = 13;
        me._graph[36].x = +0; me._graph[36].y = +1; me._graph[36].cell = 13;
        me._graph[37].x = -1; me._graph[37].y = -1; me._graph[37].cell = 14;
        me._graph[38].x = +1; me._graph[38].y = -1; me._graph[38].cell = 14;
        me._graph[39].x = -1; me._graph[39].y = +1; me._graph[39].cell = 14;
        me._graph[40].x = +1; me._graph[40].y = +1; me._graph[40].cell = 14;
        me._graph[41].x = +0; me._graph[41].y = -1; me._graph[41].cell = 15;
        me._graph[42].x = +0; me._graph[42].y = +1; me._graph[42].cell = 15;
        me._graph[43].x = +0; me._graph[43].y = -1; me._graph[43].cell = 16;
        me._graph[44].x = +0; me._graph[44].y = +1; me._graph[44].cell = 16;
        me._graph[45].x = +0; me._graph[45].y = -1; me._graph[45].cell = 17;
        me._graph[46].x = +0; me._graph[46].y = +1; me._graph[46].cell = 17;
        me._graph[47].x = -1; me._graph[47].y = -1; me._graph[47].cell = 18;
        me._graph[48].x = +1; me._graph[48].y = -1; me._graph[48].cell = 18;
        me._graph[49].x = -1; me._graph[49].y = +1; me._graph[49].cell = 18;
        me._graph[50].x = +1; me._graph[50].y = +1; me._graph[50].cell = 18;
        me._graph[51].x = +0; me._graph[51].y = -1; me._graph[51].cell = 19;
        me._graph[52].x = +0; me._graph[52].y = +1; me._graph[52].cell = 19;
        me._graph[53].x = +0; me._graph[53].y = -1; me._graph[53].cell = 20;
        me._graph[54].x = +0; me._graph[54].y = +1; me._graph[54].cell = 20;
        me._graph[55].x = +0; me._graph[55].y = -1; me._graph[55].cell = 21;
        me._graph[56].x = +0; me._graph[56].y = +1; me._graph[56].cell = 21;
        me._graph[57].x = -1; me._graph[57].y = -1; me._graph[57].cell = 22;
        me._graph[58].x = +1; me._graph[58].y = -1; me._graph[58].cell = 22;
        me._graph[59].x = -1; me._graph[59].y = +1; me._graph[59].cell = 22;
        me._graph[60].x = +1; me._graph[60].y = +1; me._graph[60].cell = 22;
        me._graph[61].x = -1; me._graph[61].y = -1; me._graph[61].cell = 23;
        me._graph[62].x = +1; me._graph[62].y = -1; me._graph[62].cell = 23;
        me._graph[63].x = -1; me._graph[63].y = +1; me._graph[63].cell = 23;
        me._graph[64].x = +1; me._graph[64].y = +1; me._graph[64].cell = 23;
        me._graph[65].x = +0; me._graph[65].y = -1; me._graph[65].cell = 24;
        me._graph[66].x = +0; me._graph[66].y = +1; me._graph[66].cell = 24;
        me._graph[67].x = +0; me._graph[67].y = -1; me._graph[67].cell = 25;
        me._graph[68].x = +0; me._graph[68].y = +1; me._graph[68].cell = 25;
        me._graph[69].x = +0; me._graph[69].y = -1; me._graph[69].cell = 26;
        me._graph[70].x = +0; me._graph[70].y = +1; me._graph[70].cell = 26;
        me._graph[71].x = +0; me._graph[71].y = -1; me._graph[71].cell = 27;
        me._graph[72].x = +0; me._graph[72].y = +1; me._graph[72].cell = 27;     
    }

    /** @type {Number[][]} */
    _graphInput = [
        [0, 1], [0, 2], [1, 12], [1, 13],//2
        [2, 3],//3

        [4, 5], [4, 6], [5, 7], [6, 7], [5, 8], [6, 19], [7, 10], [7, 20],//4
        [8, 9], [8, 10], [9, 11], [10, 11], [9, 12], [10, 23], [11, 14], [11, 24],//5
        [12, 13], [12, 14], [13, 15], [14, 15], [13, 16], [14, 27], [15, 17], [15, 28],//6
        [16, 17], [16, 18], [17, 18], [17, 31],//7

        [19, 20], [19, 21], [20, 22], [21, 22], [20, 23], [21, 33], [22, 25], [22, 33],//8
        [23, 24], [23, 25], [24, 26], [25, 26], [24, 27], [25, 35], [26, 29], [26, 35],//9
        [27, 28], [27, 29], [28, 30], [29, 30], [28, 31], [29, 37], [30, 38],//10
        [31, 32],//11

        [33, 34], [33, 35],//12
        [35, 36], [35, 37],//13
        [37, 38], [37, 39], [38, 40], [39, 40], [38, 41], [39, 47], [40, 48],//14
        [41, 42],//15

        [43, 44], [43, 45],//16
        [45, 46], [45, 47],//17
        [47, 48], [47, 49], [48, 50], [49, 50], [48, 51], [49, 57], [50, 58],//18
        [51, 52],//19

        [53, 54], [53, 55],//20
        [55, 56], [55, 57],//21
        [57, 58], [57, 59], [58, 60], [59, 60], [58, 61], [59, 69], [60, 63], [60, 69],//22
        [61, 62], [61, 63], [62, 64], [63, 64], [63, 71], [64, 71],//23

        [65, 66], [65, 67],//24
        [67, 68], [67, 69],//25
        [69, 70], [69, 71],//26
        [71, 72]//27
    ]

    /** @type {Node[]} */
    _graph = [];
}