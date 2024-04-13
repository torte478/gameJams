import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Enums from './Enums.js';

export default class InteriorComponent {
    
    state = {
        isActive: false,
        delta: 0,
    }

    _center = Utils.buildPoint(2180, 300);

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    _camera;

    /** @type {Phaser.Tweens.Tween} */
    _resizeTween;

    /** @type {Phaser.Events.EventEmitter} */
    _events;

    constructor(events) {
        const me = this;

        me._events = events;

        me._camera = Here._.cameras.add(800, 210, 200, 600)
            .setBackgroundColor('#9badb7')
            .setZoom(0.5);

        const interior = Here._.add.image(me._center.x, me._center.y, 'busInterior');
        me._camera.centerOn(me._center.x, me._center.y);
    }

    update(delta) {
        const me = this;

        me.state.delta = delta;

        const isActive = Phaser.Geom.Rectangle.Contains(
            me._camera.worldView,
            Here._.input.activePointer.worldX,
            Here._.input.activePointer.worldY);

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
}