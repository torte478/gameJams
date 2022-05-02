import Phaser from '../lib/phaser.js';

import Enums from '../Enums.js';

import State from './State.js';

export default class DarkState extends State {

    /** 
     * @returns {Number}
     */
    getName() {
        return Enums.GameState.DARK;
    }
}