import Consts from "../game/Consts.js";

export default class Utils {

    /**
     * @param {Array} arr 
     * @param {Function} predicate 
     * @returns {any}
     */
    static firstOrDefault(arr, predicate) {
        for (let i = 0; i < arr.length; ++i) {
            if (!!predicate(arr[i])) {
                return arr[i];
            }
        }

        return null;
    }

    static getYbyLevel(level) {
        return level == Consts.levelType.TOP
            ? Consts.height.top
            : level == Consts.levelType.MIDDLE
                ? Consts.height.middle
                : Consts.height.floor;
    }

    /**
     * @param {Phaser.Scene} scene 
     */
    static runLoadingBar(scene) {
        const progressBar = scene.add.graphics();
        const progressBox = scene.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);

        var width = scene.cameras.main.width;
        var height = scene.cameras.main.height;

        const loadingText = scene.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        progressBox.fillRect(
            (width - 320) / 2, 
            (height - 50) / 2, 
            320, 
            50);

        scene.load.on('progress', value => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(
                (width - 300) / 2, 
                (height - 30) / 2,
                300 * value, 
                30);
        });

        scene.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }
}