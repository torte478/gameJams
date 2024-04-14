import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Components from './Components.js';
import Enums from './Enums.js';
import Node from './Node.js';

export default class InteriorComponent {
    
    consts = {
        gridPos: Utils.buildPoint(2030, 85),
        doorIndex: 18,
        paymentIndicies: [13],
        speed: 100,
        swapSpeed: 25,
        zoom: 0.4,
        badTint: 0xFF0000,

        depth: {
            selection: 1000
        }
    }

    state = {
        isActive: false,
        delta: 0,
        iid: 1,
    }

    /** @type {Components} */
    _components;

    _center = Utils.buildPoint(2180, 370);

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    _camera;

    /** @type {Phaser.Tweens.Tween} */
    _resizeTween;

    /** @type {Phaser.Events.EventEmitter} */
    _events;

    /** @type {Phaser.GameObjects.Group} */
    _spritePool;

    /** @type {Phaser.Geom.Rectangle} */
    _interiorRectangle;

    _selection = {
        /** @type {Phaser.GameObjects.Image} */
        aim: null,
        /** @type {Phaser.GameObjects.Image} */
        passenger: null,
        /** @type {Phaser.GameObjects.Image} */
        tile: null,
        /** @type {Number} */
        nodeIndex: 0
    }

    constructor(events) {
        const me = this;

        me._events = events;
        me._spritePool = Here._.add.group();

        me._camera = Here._.cameras.add(800, 210, 200, 600)
            .setBackgroundColor('#00A3C4')
            .setZoom(me.consts.zoom)
            .setRoundPixels(false);

        Here._.add.image(me._center.x, me._center.y - 20, 'busInterior');
        me._camera.centerOn(me._center.x, me._center.y);
        me._interiorRectangle = new Phaser.Geom.Rectangle(me.consts.gridPos.x, me.consts.gridPos.y, 320, 560);

        me._buildGraph();

        me._selection.aim = me._spritePool.create(me._center.x, me._center.y, 'passengerInside', 0);
        me._selection.aim.setVisible(false).setDepth(me.consts.depth.selection);
        me._selection.tile = me._spritePool.create(me._center.x, me._center.y, 'passengerInside', 2);
        me._selection.tile.setVisible(false).setDepth(me.consts.depth.selection);
        Here._.input.on('pointerdown', me._onPointerDown, me);
        
        me._events.on('passengerIn', me._onPassengerIn, me);
        me._events.on('busStatusChanged', me._onBusStatusChanged, me);
        me._events.on('paymentComplete', me._onPaymentComplete, me);
        me._events.on('componentActivated', me._onComponentActivated, me);
        me._events.on('stratagemSummon', me._onStratagemSummon, me);
    }

    update(delta) {
        const me = this;

        me.state.delta = delta;

        me._checkActivation();
        me._movePassengers(delta);
        me._processSelection();
    }

    isDoorFree() {
        const me = this;

        return me._graph[me.consts.doorIndex].isFree(Infinity);
    }

    _onPointerDown(pointer) {
        const me = this;

        if (pointer.rightButtonDown()) {
            me._clearSelection();
            return;
        }

        if (me._selection.passenger == null)
            me._trySelectPassenger(pointer);        
        else
            me._tryRedirectPassenger();
    }

    _tryRedirectPassenger() {
        const me = this;

        if (me._selection.passenger == null || !me._selection.tile.visible)
            return;

        me._selection.passenger.playerCommand = me._selection.nodeIndex;
        me._clearSelection();
    }

    _clearSelection() {
        const me = this;

        me._selection.aim.setVisible(false);
        me._selection.nodeIndex = -1;
        me._selection.tile.setVisible(false);
        me._selection.passenger = null;
    }

    _trySelectPassenger(pointer) {
        const me = this;

        const selected = Utils.firstOrNull(
            me._enumeratePassengers(),
            p => Phaser.Geom.Rectangle.Contains(
                p.passenger.getBounds(),
                pointer.worldX,
                pointer.worldY));

        if (selected == null)
            return;

        if (selected.passenger.state != Enums.PassengerState.NORMAL)
            return;

        me._selection.passenger = selected.passenger;
        me._selection.aim.setVisible(true);
        me._selection.tile.setVisible(true);
    }

    _processSelection() {
        const me = this;

        if (!!me._selection.passenger) {
            me._moveAimAndTile();
        }
    }

    _moveAimAndTile() {
        const me = this;

        me._selection.aim.setPosition(me._selection.passenger.x, me._selection.passenger.y);

        const mousePos = Utils.buildPoint(
            Here._.input.activePointer.worldX, 
            Here._.input.activePointer.worldY);

        if (!Phaser.Geom.Rectangle.ContainsPoint(me._interiorRectangle, mousePos)) {
            me._selection.tile.setVisible(false);
            return;
        } 

        me._selection.tile.setVisible(true);
        const closest = me._getClosestNode(mousePos);
        me._selection.nodeIndex = closest.index;
        me._selection.tile.setPosition(closest.x, closest.y);
    }

    _getClosestNode(mousePos) {
        const me = this;

        let minDist = Infinity;
        let pos = null;
        let minIndex = -1;
        for (let i = 0; i < me._graph.length; ++i) {
            const nodePos = me._toWorldPosition(i);
            const dist = Phaser.Math.Distance.BetweenPoints(mousePos, nodePos);

            if (dist < minDist) {
                minDist = dist;
                pos = nodePos;
                minIndex = i;
            }
        }

        return {index: minIndex, x: pos.x, y: pos.y};
    }

    _onPaymentComplete(iid, success) {
        const me = this;

        const index = Utils.firstIndexOrNull(me._graph, n => !!n.passenger && n.passenger.iid == iid);

        const passenger = me._graph[index].passenger;
        me._changeState(passenger, Enums.PassengerState.EXIT);

        if (!success) {
            passenger.clearTint();
            passenger.setTint(me.consts.badTint)
        }

        me._startMoving(passenger, index, me.consts.doorIndex);
    }

    _onBusStatusChanged(status) {
        const me = this;

        const passengers = me._enumeratePassengers();
        if (status == Enums.BusStatus.DEPARTURE) {
            for (let i = 0; i < passengers.length; ++i) {
                const passenger = passengers[i].passenger;
                const old = passenger.destination;
                passenger.destination--;

                const tint = me._getTint(passenger.destination);
                if (tint != null){
                    passenger.clearTint();
                    passenger.setTint(tint);
                }

                if (passenger.destination < 0 && old >= 0) {
                    me._changeState(passenger, Enums.PassengerState.EXIT);
                    me._startMoving(passenger, passengers[i].index, me.consts.doorIndex);
                    if (me._components.money._paymentIid == passenger.iid)
                        me._components.money._paymentIid = null;
                }
            }
        }

        if (status == Enums.BusStatus.PREPARE_TO_EXIT) {
            for (let i = 0; i < passengers.length; ++i) {
                const passenger = passengers[i].passenger;
                if (passenger.destination > 0)
                    continue;

                if (passenger.state >= Enums.PassengerState.PAYMENT)
                    continue;

                me._changeState(passenger, Enums.PassengerState.READY_TO_PAYMENT);
                me._startMoving(passenger, passengers[i].index, Utils.getRandomEl(me.consts.paymentIndicies));
            }
        }

        if (status == Enums.BusStatus.EXIT) {
            me._checkExitComplete();
        }
    }

    _getTint(destination) {
        const me = this;

        if (destination < 0)
            return me.consts.badTint;

        if (destination == 0)
            return 0x00FF00;

        if (destination == 1)
            return 0xdcff00;

        if (destination == 2)
            return 0xe7f684;

        return null;
    }

    _enumeratePassengers() {
        const me = this;

        const result = [];
        for (let i = 0; i < me._graph.length; ++i) {
            const passenger = me._graph[i].passenger;
            if (!!passenger)
                result.push({index: i, passenger: passenger});
        }
        return result;
    }

    _checkActivation() {
        const me = this;

        const isActive = Phaser.Geom.Rectangle.Contains(
            new Phaser.Geom.Rectangle(me._camera.x, me._camera.y, me._camera.width, me._camera.height),
            Here._.input.activePointer.x,
            Here._.input.activePointer.y);

        if (me.state.isActive != isActive && isActive)
            me._events.emit('componentActivated', Enums.Components.INTERIOR);

        me.state.isActive = isActive;
    }

    _onComponentActivated(component) {
        const me = this;

        if (component == Enums.Components.ROAD)
            me._resizeComponent(800, 210, 200, 600, me.consts.zoom);

        if (component == Enums.Components.INTERIOR)
            me._resizeComponent(600, 210, 400, 600, 1);

        if (component == Enums.Components.MONEY)
            me._resizeComponent(600, 460, 400, 350, me.consts.zoom);
    }

    _resizeComponent(x, y, width, height, zoom) {
        const me = this;

        if (!!me._resizeTween)
            me._resizeTween.stop();

        const percentage = Math.abs(width, me._camera.width) / width;

        me._resizeTween = Here._.add.tween({
            targets: me._camera,
            x: x,
            y: y,
            width: width,
            height: height,
            zoom: zoom,
            duration: 1000 * percentage,
            ease: 'Sine.easeOut',
            onUpdate: () => me._camera.centerOn(me._center.x, me._center.y)
        });
    }

    _checkExitComplete() {
        const me = this;

        const exitingPasengers = me._enumeratePassengers()
            .filter(x => x.passenger.destination <= 0)
            .length;

        if (exitingPasengers == 0)
            me._events.emit('exitComplete');
    }

    _isPaymentPosition(index) {
        const me = this;

        return Utils.contains(me.consts.paymentIndicies, index);
    }

    _toWorldPosition(index) {
        const me = this;

        const node = me._graph[index];

        return Utils.buildPoint(
            me.consts.gridPos.x + (node.cell % 4) * 80 + 40 + node.x * 20,
            me.consts.gridPos.y + Math.floor(node.cell / 4) * 80 + 40 + node.y * 20,
        );
    }

    _findFreeNode() {
        const me = this;

        const freeSpaces = [];
        for (let i = 0; i < me._graph.length; ++i) {
            if (i != me.consts.doorIndex && !me._graph[i].passenger)
                freeSpaces.push(i);
        }

        if (freeSpaces.length == 0)
            return null;
        
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
                const totalDistance = distances[currentNode] + (!!me._graph[neighbor].passenger ? 5 : 1);
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

        me._graph[0].x =  +1; me._graph[0].y =  -1; me._graph[0].cell = 2;
        me._graph[1].x =  +1; me._graph[1].y =  +1; me._graph[1].cell = 2;
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

    _onPassengerIn() {
        const me = this;

        const freeNode = me._findFreeNode();
        if (!freeNode) {
            Utils.debugLog("CAN'T ENTER!!!");
            return;
        }

        const pos = me._toWorldPosition(me.consts.doorIndex);
        const passenger = me._spritePool.create(pos.x + 40, pos.y, 'passengerInside', 1);

        passenger.state = Enums.PassengerState.NORMAL;
        passenger.iid = me.state.iid++;
        passenger.destination = Utils.getRandom(1, 5, 1);
        passenger.playerCommand = null;
        passenger.isSwap = false;

        me._graph[me.consts.doorIndex].passenger = passenger;
        me._graph[me.consts.doorIndex].lease(passenger);

        me._startMoving(passenger, me.consts.doorIndex, freeNode);
    }

    _startMoving(passenger, from, to) {
        const me = this;

        const path = me._findPath(from, to);
        passenger.path = path;
        passenger.isBusy = true;

        Utils.debugLog(`${passenger.iid}: ${path[0]} => ${path[path.length - 1]}`);
    }

    _movePassengers(delta) {
        const me = this;

        for (let i = 0; i < me._graph.length; ++i) {
            const passenger = me._graph[i].passenger;
            if (!passenger)
                continue;

            passenger.setDepth(passenger.y - me.consts.gridPos.y);

            if (passenger.path.length == 0) {
                if (me._components.road.isStoppedInsideBusArea() && passenger.state == Enums.PassengerState.EXIT)
                    me._processPasengerExit(i, passenger);
                else if (passenger.playerCommand != null && passenger.state == Enums.PassengerState.NORMAL) {
                    me._startMoving(passenger, i, passenger.playerCommand);
                    passenger.playerCommand = null;
                }
                continue;
            }

            const target = passenger.path[0];
            if (!me._tryMoveThrough(i, passenger, target))
                continue;

            // change pos
            const pos = me._toWorldPosition(target);
            const speed = passenger.isSwap ? me.consts.swapSpeed : me.consts.speed;
            passenger.setPosition(
                passenger.x + delta * speed * Math.sign(pos.x - passenger.x),
                passenger.y + delta * speed * Math.sign(pos.y - passenger.y),
            );

            me._checkOnTarget(i, passenger, pos, target);
        }
    }

    _processPasengerExit(index, passenger) {
        const me = this;

        me._graph[index].passenger = null;
        me._graph[index].release();
        me._spritePool.killAndHide(passenger);
        
        me._events.emit('onPasangerExit');

        me._checkExitComplete();
    }

    _tryMoveThrough(index, passenger, target) {
        const me = this;

        if (me._graph[target].isFree(passenger.iid)) {
            me._graph[target].lease(passenger.iid);    
            return true;
        }
        
        const other = me._graph[target].passenger;
        if (!other)
            return false;

        if (other.iid == passenger.iid)
            return true;

        if (other.isBusy)
            return false;

        if (other.state > passenger.state)
            return false;

        if (other.state == Enums.PassengerState.EXIT)
            return false;

        if (other.state == passenger.state && other.path.length >= passenger.path.length)
            return false;

        Utils.debugLog(`swap ${index} <> ${target} (${passenger.iid}, ${other.iid})`);

        me._graph[target].passenger = passenger;
        me._graph[index].passenger = other;
        passenger.isSwap = true;
        other.isSwap = true;
        other.path = [index];
        other.isBusy = true;

        return true;
    }

    _changeState(passenger, state) {
        const me = this;

        Utils.debugLog(`change ${passenger.iid}: ${passenger.state} => ${state}`);
        passenger.state = state;
    }

    _checkOnTarget(index, passenger, pos, target) {
        const me = this;

        if (Phaser.Math.Distance.BetweenPoints(passenger, pos) > 5)
            return;

        passenger.path.shift();
    
        passenger.isBusy = passenger.path.length > 0;
        me._graph[index].passenger = null;
        me._graph[target].passenger = passenger;
        me._graph[target].release();
        passenger.isSwap = false;

        if (passenger.playerCommand != null && passenger.state == Enums.PassengerState.NORMAL) {
            me._startMoving(passenger, target, passenger.playerCommand);
            passenger.playerCommand = null;
            return;
        }

        if (passenger.isBusy)
            return;
        
        Utils.debugLog(`${passenger.iid} finish at ${target}`);

        if (me._isPaymentPosition(target) && passenger.destination == 0) {
            if (passenger.state >= Enums.PassengerState.PAYMENT)
                return;

            me._events.emit('paymentStart', passenger.iid);
            me._changeState(passenger, Enums.PassengerState.PAYMENT);
            return;
        }

        if (target == me.consts.doorIndex && passenger.state != Enums.PassengerState.EXIT) {
            const freeNode = me._findFreeNode();
            if (!!freeNode)
                me._startMoving(passenger, target, freeNode);
        }
    }

    _onStratagemSummon(stratagem) {
        const me = this;

        if (stratagem == Enums.StratagemType.FIX_BUGS) {
            for (let i = 0; i < me._graph.length; ++i) {
                const passenger = me._graph[i].passenger;
                me._graph[i].release();
                me._graph[i].passenger = null;
                me._spritePool.killAndHide(passenger);
            }
            me._components.money._paymentIid = null;
            me._components.money._showText(false);
            me._checkExitComplete();
        }
    }
}