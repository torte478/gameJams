import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Components from './Components.js';
import Enums from './Enums.js';
import Node from './Node.js';

export default class InteriorComponent {
    
    consts = {
        pos: Utils.buildPoint(2000, 80),
        doorIndex: 7,
        paymentIndex: 6,
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

    /** @type {Phaser.GameObjects.Image[]} */
    _passengers = [];

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

        throw `not implemented`;
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

        throw 'not implemented';
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
                while (current) {
                    path.unshift(current);
                    current = previous[current];
                }
                return path.map(x => Number(x));
            }
    
            for (let i = 0; i < me._graph[currentNode].paths.length; ++i) {
                const neighbor = me._graph[currentNode].neighbours[i];
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

        me._graph[0].x =  +0; me._graph[0].y =  -1;
        me._graph[1].x =  +0; me._graph[1].y =  +1;
        me._graph[2].x =  +0; me._graph[2].y =  -1;
        me._graph[3].x =  +0; me._graph[3].y =  +1;
        me._graph[4].x =  -1; me._graph[4].y =  -1;
        me._graph[5].x =  +1; me._graph[5].y =  -1;
        me._graph[6].x =  -1; me._graph[6].y =  +1;
        me._graph[7].x =  +1; me._graph[7].y =  +1;
        me._graph[8].x =  -1; me._graph[8].y =  -1;
        me._graph[9].x =  +1; me._graph[9].y =  -1;
        me._graph[10].x = -1; me._graph[10].y = +1;
        me._graph[11].x = +1; me._graph[11].y = +1;
        me._graph[12].x = -1; me._graph[12].y = -1;
        me._graph[13].x = +1; me._graph[13].y = -1;
        me._graph[14].x = -1; me._graph[14].y = +1;
        me._graph[15].x = +1; me._graph[15].y = +1;
        me._graph[16].x = -1; me._graph[16].y = -1;
        me._graph[17].x = -1; me._graph[17].y = +1;
        me._graph[18].x = +1; me._graph[18].y = +0;
        me._graph[19].x = -1; me._graph[19].y = -1;
        me._graph[20].x = +1; me._graph[20].y = -1;
        me._graph[21].x = -1; me._graph[21].y = +1;
        me._graph[22].x = +1; me._graph[22].y = +1;
        me._graph[23].x = -1; me._graph[23].y = -1;
        me._graph[24].x = +1; me._graph[24].y = -1;
        me._graph[25].x = -1; me._graph[25].y = +1;
        me._graph[26].x = +1; me._graph[26].y = +1;
        me._graph[27].x = -1; me._graph[27].y = -1;
        me._graph[28].x = +1; me._graph[28].y = -1;
        me._graph[29].x = -1; me._graph[29].y = +1;
        me._graph[30].x = +1; me._graph[30].y = +1;
        me._graph[31].x = +0; me._graph[31].y = -1;
        me._graph[32].x = +0; me._graph[32].y = +1;
        me._graph[33].x = +0; me._graph[33].y = -1;
        me._graph[34].x = +0; me._graph[34].y = +1;
        me._graph[35].x = +0; me._graph[35].y = -1;
        me._graph[36].x = +0; me._graph[36].y = +1;
        me._graph[37].x = -1; me._graph[37].y = -1;
        me._graph[38].x = +1; me._graph[38].y = -1;
        me._graph[39].x = -1; me._graph[39].y = +1;
        me._graph[40].x = +1; me._graph[40].y = +1;
        me._graph[41].x = +0; me._graph[41].y = -1;
        me._graph[42].x = +0; me._graph[42].y = +1;
        me._graph[43].x = +0; me._graph[43].y = -1;
        me._graph[44].x = +0; me._graph[44].y = +1;
        me._graph[45].x = +0; me._graph[45].y = -1;
        me._graph[46].x = +0; me._graph[46].y = +1;
        me._graph[47].x = -1; me._graph[47].y = -1
        me._graph[48].x = +1; me._graph[48].y = -1;
        me._graph[49].x = -1; me._graph[49].y = +1;
        me._graph[50].x = +1; me._graph[50].y = +1;
        me._graph[51].x = +0; me._graph[51].y = -1;
        me._graph[52].x = +0; me._graph[52].y = +1;
        me._graph[53].x = +0; me._graph[53].y = -1;
        me._graph[54].x = +0; me._graph[54].y = +1;
        me._graph[55].x = +0; me._graph[55].y = -1;
        me._graph[56].x = +0; me._graph[56].y = +1;
        me._graph[57].x = -1; me._graph[57].y = -1
        me._graph[58].x = +1; me._graph[58].y = -1;
        me._graph[59].x = -1; me._graph[59].y = +1;
        me._graph[60].x = +1; me._graph[60].y = +1;
        me._graph[61].x = -1; me._graph[61].y = -1;
        me._graph[62].x = +1; me._graph[62].y = -1;
        me._graph[63].x = -1; me._graph[63].y = +1;
        me._graph[64].x = +1; me._graph[64].y = +1;
        me._graph[65].x = +0; me._graph[65].y = -1;
        me._graph[66].x = +0; me._graph[66].y = +1;
        me._graph[67].x = +0; me._graph[67].y = -1;
        me._graph[68].x = +0; me._graph[68].y = +1;
        me._graph[69].x = +0; me._graph[69].y = -1;
        me._graph[70].x = +0; me._graph[70].y = +1;
        me._graph[71].x = +0; me._graph[71].y = -1;
        me._graph[72].x = +0; me._graph[72].y = +1;            
    }

    /** @type {Number[][]} */
    _graphInput = [
        [0, 1], [0, 2], [1, 12], [1, 13], //0
        [2, 3], //2

        [4, 5], [4, 6], [5, 7], [6, 7], [5, 8], [6, 19], [7, 10], [7, 20], //3
        [8, 9], [8, 10], [9, 11], [10, 11], [9, 12], [10, 23], [11, 14], [11, 24], //4
        [12, 13], [12, 14], [13, 15], [14, 15], [13, 16], [14, 27], [15, 17], [15, 29], //5
        [16, 17], [16, 18], [17, 18], [17, 31], //6

        [19, 20], [19, 21], [20, 22], [21, 22], [20, 23], [21, 33], [22, 25], [22, 33], //7
        [23, 24], [23, 25], [24, 26], [25, 26], [24, 27], [25, 35], [26, 29], [26, 35], //8
        [27, 28], [27, 29], [28, 30], [29, 30], [28, 31], [29, 37], [30, 38], //9
        [31, 32], //10

        [33, 34], [33, 35], //11
        [35, 36], [35, 37], //12
        [37, 38], [37, 39], [38, 40], [39, 40], [38, 41], [39, 47], [40, 48], //13
        [41, 42], //14

        [43, 44], [43, 45], //15
        [45, 46], [45, 47], //16
        [47, 48], [47, 49], [48, 50], [49, 50], [48, 51], [49, 57], [50, 58], //17
        [51, 52], //18

        [53, 54], [53, 55], //19
        [55, 56], [55, 57], //20
        [57, 58], [57, 59], [58, 60], [59, 60], [58, 61], [59, 69], [60, 63], [60, 69], //21
        [61, 62], [61, 63], [62, 64], [63, 64], [63, 71], [64, 71], //22

        [65, 66], [65, 67], //23
        [67, 68], [67, 69], //24
        [69, 70], [69, 71], //25
        [71, 72] //26
    ]

    /** @type {Node[]} */
    _graph = [];
}