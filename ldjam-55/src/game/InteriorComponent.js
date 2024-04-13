import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Components from './Components.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Node from './Node.js';

export default class InteriorComponent {
    
    consts = {
        pos: Utils.buildPoint(2055, 75),
        exitIndex: 7,
        paymentIndex: 6
    }

    state = {
        isActive: false,
        delta: 0,
        lastActivationChange: 0
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

        for (let i = 0; i < me._graph.length; ++i)
            me._graph[i].index = i;

        me._camera = Here._.cameras.add(800, 210, 200, 600)
            .setBackgroundColor('#9badb7')
            .setZoom(0.5)
            .setRoundPixels(false);

        Here._.add.image(me._center.x, me._center.y, 'busInterior');
        me._camera.centerOn(me._center.x, me._center.y);
        
        me._events.on('passengerIn', me._onPassengerIn, me);
    }

    update(delta) {
        const me = this;

        me.state.delta = delta;

        me._checkActivation();
        me._movePassengers();
    }

    _movePassengers() {
        const me = this;

        for (let i = 0; i < me._passengers.length; ++i) {
            const passenger = me._passengers[i];
            if (passenger.path.length == 0)
                continue;

            if (!!passenger.moveTween)
                continue;

            const target = me._getWorldPos(passenger.path.shift());
            passenger.moveTween = Here._.add.tween({
                targets: passenger,
                x: target.x,
                y: target.y,
                duration: 500,
                onComplete: () => {
                    passenger.moveTween = null;
                }
            });
        }
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

        const freePlace = me._findFreePlace();

        const pos = me._getWorldPos(me.consts.exitIndex);
        const passenger = me._spritePool.create(pos.x, pos.y, 'passengerInside');
        me._passengers.push(passenger);
        
        passenger.path = me._findPath(me.consts.exitIndex, freePlace.index).slice(1);
        console.log(passenger.path);
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
    
            for (let i = 0; i < me._graph[currentNode].neighbours.length; ++i) {
                const neighbor = me._graph[currentNode].neighbours[i];
                const totalDistance = distances[currentNode] + 1; //graph[currentNode][neighbor];
                if (totalDistance < distances[neighbor]) {
                    distances[neighbor] = totalDistance;
                    previous[neighbor] = currentNode;
                }
            }
        }
    }

    _findFreePlace() {
        const me = this;

        const freePlaces = me._graph
                            .filter((x, i) => me._isFree(i), me);

        const place = Utils.getRandomEl(freePlaces);

        return place;
    }

    /**
     * @param {Phaser.GameObjects.Image} passenger 
     */
    _getGraphIndex(passenger) {
        const me = this;

        const x = Math.floor((passenger.x - me.consts.pos.x) / 75);
        const y = Math.floor((passenger.y - me.consts.pos.y) / 75);

        return y * 4 + x;
    }

    _isFree(index) {
        const me = this;

        return true; // TODO
    }

    _getWorldPos(index) {
        const me = this;

        return Utils.buildPoint(
            me.consts.pos.x + index % 4 * 75 + (75/2),
            me.consts.pos.y + Math.floor(index / 4) * 75 + (75/2)
        );
    }

    /** @type {Node[]} */
    _graph = [
        // 0
        {
            // 0
            type: Enums.NodeType.Unavailable,
            neighbours: []
        },
        {
            // 1
            type: Enums.NodeType.Unavailable,
            neighbours: []
        },
        {
            // 2
            type: Enums.NodeType.Pass,
            neighbours: [ 3, 6 ]
        },
        {
            // 3
            type: Enums.NodeType.Seat,
            neighbours: [ 2 ]
        },
        // 1
        {
            // 4
            type: Enums.NodeType.Pass,
            neighbours: [ 5, 8]
        },
        {
            // 5
            type: Enums.NodeType.Pass,
            neighbours: [ 4, 6, 9 ]
        },
        {
            // 6
            type: Enums.NodeType.Pass,
            neighbours: [ 2, 5, 7, 10 ]
        },
        {
            // 7
            type: Enums.NodeType.Pass,
            neighbours: [ 6, 11 ]
        },
        // 2
        {
            // 8
            type: Enums.NodeType.Pass,
            neighbours: [ 4, 9, 12]
        },
        {
            // 9
            type: Enums.NodeType.Pass,
            neighbours: [ 5, 8, 10, 13 ]
        },
        {
            // 10
            type: Enums.NodeType.Pass,
            neighbours: [ 6, 9, 11, 14 ]
        },
        {
            // 11
            type: Enums.NodeType.Seat,
            neighbours: [ 7, 10 ]
        },
        // 3
        {
            // 12
            type: Enums.NodeType.Seat,
            neighbours: [ 8, 13 ]
        },
        {
            // 13
            type: Enums.NodeType.Seat,
            neighbours: [ 9, 12, 14 ]
        },
        {
            // 14
            type: Enums.NodeType.Pass,
            neighbours: [ 10, 13, 15, 18 ]
        },
        {
            // 15
            type: Enums.NodeType.Seat,
            neighbours: [ 14 ]
        },
        // 4
        {
            // 16
            type: Enums.NodeType.Seat,
            neighbours: [ 17 ]
        },
        {
            // 17
            type: Enums.NodeType.Seat,
            neighbours: [ 16, 18 ]
        },
        {
            // 18
            type: Enums.NodeType.Pass,
            neighbours: [ 14, 17, 19, 22 ]
        },
        {
            // 19
            type: Enums.NodeType.Seat,
            neighbours: [ 18 ]
        },
        // 5
        {
            // 20
            type: Enums.NodeType.Seat,
            neighbours: [ 21 ]
        },
        {
            // 21
            type: Enums.NodeType.Seat,
            neighbours: [ 20, 22 ]
        },
        {
            // 22
            type: Enums.NodeType.Pass,
            neighbours: [ 18, 21, 23, 26 ]
        },
        {
            // 23
            type: Enums.NodeType.Pass,
            neighbours: [ 22, 27 ]
        },
        // 6
        {
            // 24
            type: Enums.NodeType.Seat,
            neighbours: [ 25 ]
        },
        {
            // 25
            type: Enums.NodeType.Seat,
            neighbours: [ 24, 26 ]
        },
        {
            // 26
            type: Enums.NodeType.Seat,
            neighbours: [ 22, 25, 27 ]
        },
        {
            // 27
            type: Enums.NodeType.Seat,
            neighbours: [ 26, 27 ]
        }
    ]
}