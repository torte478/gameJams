import Config from "../game/Config.js";
import Here from "./Here.js";

export default class Utils {
  // --- Collections ---

  /**
   * @param {Array} array
   * @param {Function} f
   */
  static all(array, f) {
    for (let i = 0; i < array.length; ++i) {
      if (!f(array[i])) return false;
    }

    return true;
  }

  /**
   * @param {Array} array
   * @param {Function} f
   */
  static any(array, f) {
    for (let i = 0; i < array.length; ++i) {
      if (!!f(array[i])) return true;
    }

    return false;
  }

  /**
   * @param {Array} array
   * @param {Function} f
   * @returns {Object}
   */
  static firstOrNull(array, f) {
    for (let i = 0; i < array.length; ++i) {
      if (!!f(array[i])) {
        return array[i];
      }
    }

    return null;
  }

  /**
   * @param {Array} array
   * @param {Function} f
   * @returns {Object}
   */
  static lastOrNull(array, f) {
    for (let i = array.length - 1; i >= 0; --i) {
      if (!!f(array[i])) {
        return array[i];
      }
    }

    return null;
  }

  /**
   * @param {Array} array
   * @param {Function} f
   * @returns {Object}
   */
  static lastIndexOrNull(array, f) {
    for (let i = array.length - 1; i >= 0; --i) {
      if (!!f(array[i])) {
        return i;
      }
    }

    return null;
  }

  /**
   * @param {Array} array
   * @param {Function} f
   * @returns {Number}
   */
  static firstIndexOrNull(array, f) {
    for (let i = 0; i < array.length; ++i) {
      if (!!f(array[i])) {
        return i;
      }
    }

    return null;
  }

  /**
   * @param {Array} array
   * @param {Function} f
   * @returns {Object}
   */
  static single(array, f) {
    let result;

    for (let i = 0; i < array.length; ++i) {
      if (!!f(array[i])) {
        if (!!result) throw "array contains more that single occurrence";

        result = array[i];
      }
    }

    if (!result) throw "array not contains single occurrence";

    return result;
  }

  /**
   * @param {Array} array
   * @param {Object} elem
   * @returns {Boolean}
   */
  static contains(array, elem) {
    for (let i = 0; i < array.length; ++i) if (array[i] === elem) return true;

    return false;
  }

  /**
   * @param {Number} length
   * @param {Object} value
   * @returns {Object[]}
   */
  static buildArray(length, value) {
    const result = [];

    for (let i = 0; i < length; ++i) result.push(value);

    return result;
  }

  /**
   * @param {Array} source
   * @returns {Array}
   */
  static copyArray(source) {
    const result = [];

    for (let i = 0; i < source.length; ++i) result.push(source[i]);

    return result;
  }

  /**
   * @param {Array} array
   * @param {Number} index
   * @returns {Array}
   */
  static removeAt(array, index) {
    const result = [];
    for (let i = 0; i < array.length; ++i)
      if (i != index) result.push(array[i]);
    return result;
  }

  // --- Matrix ---

  /**
   * @param {any[][]} arr
   * @param {Number} index
   * @returns {Object}
   */
  static toMatrixIndex(arr, index) {
    const height = arr.length;
    const width = arr[0].length;

    return { i: Math.floor(index / height), j: index % width };
  }

  /**
   *
   * @param {any[][]} arr
   * @param {Number} i
   * @param {Number} j
   * @returns {Number}
   */
  static fromMatrix(arr, i, j) {
    const height = arr.length;
    return i * height + j;
  }

  /**
   *
   * @param {any[][]} arr
   * @param {Number} i
   * @param {Number} j
   * @returns {Object[]}
   */
  static getNeighbours(arr, i, j) {
    const result = [];
    for (let y = -1; y <= 1; ++y)
      for (let x = -1; x <= 1; ++x) {
        const nextI = i + y;
        const nextJ = j + x;

        if (nextI == i && nextJ == j) continue;

        if (nextI < 0 || nextI >= arr.length) continue;

        if (nextJ < 0 || nextJ >= arr[nextI].length) continue;

        result.push({ i: nextI, j: nextJ });
      }

    return result;
  }

  // --- Geometry ---

  /**
   * @param {Number} x
   * @param {Number} y
   * @returns {Phaser.Math.Vector2}
   */
  static buildPoint(x, y) {
    return new Phaser.Math.Vector2(x, y);
  }

  /**
   * @param {Object} obj
   * @returns {Phaser.Math.Vector2}
   */
  static toPoint(obj) {
    if (obj.x == undefined) throw "obj is not contains property X";

    if (obj.y == undefined) throw "obj is not contains property Y";

    return new Phaser.Math.Vector2(obj.x, obj.y);
  }

  // --- Random ---

  /**
   * @param {Object[]} arr
   * @returns {Object}
   */
  static getRandomEl(arr) {
    const index = Phaser.Math.Between(0, arr.length - 1);
    return arr[index];
  }

  /**
   * @param {Number} from
   * @param {Number} to
   * @param {Number} debug
   * @returns {Number}
   */
  static getRandom(from, to, debug) {
    return debug !== undefined && Config.Debug.Global && Config.Debug.Random
      ? debug
      : Phaser.Math.Between(from, to);
  }

  /**
   * @param {Array} array
   * @param {Number} count
   * @returns {Array}
   */
  static getRandomElems(array, count) {
    if (count > array.length) throw `invalid count: ${count}`;

    const result = [];
    let arr = Utils.copyArray(array);
    while (result.length < count) {
      const index = Phaser.Math.Between(0, arr.length - 1);
      result.push(arr[index]);
      arr = Utils.removeAt(arr, index);
    }

    return result;
  }

  /**
   * @param {Array} array
   * @returns {Array}
   */
  static shuffle(array) {
    return Utils.getRandomElems(array, array.length);
  }

  // --- Start loading ---

  /**
   * @param {String} name
   * @param {Number} width
   * @param {Number} height
   */
  static loadSpriteSheet(name, width, height) {
    return Here._.load.spritesheet(name, `assets/${name}.png`, {
      frameWidth: width,
      frameHeight: !!height ? height : width,
    });
  }

  /**
   * @param {String} name
   */
  static loadImage(name) {
    return Here._.load.image(name, `assets/${name}.png`);
  }

  /**
   * @param {String} name
   */
  static loadWav(name) {
    return Here._.load.audio(name, `assets/${name}.wav`);
  }

  /**
   * @param {String} name
   */
  static loadMp3(name) {
    return Here._.load.audio(name, `assets/${name}.mp3`);
  }

  /**
   * @param {String} name
   */
  static loadCsv(name) {
    return Here._.load.tilemapCSV(name, `assets/${name}.csv`);
  }

  // --- Debug ---

  /**
   * @param {Boolean} flag
   * @param {Function} func
   * @returns {Boolean}
   */
  static ifDebug(flag, func) {
    if (Utils.isDebug(flag)) return func();

    return false;
  }

  /**
   * @param {Boolean} flag
   * @returns {Boolean}
   */
  static isDebug(flag) {
    return Config.Debug.Global && flag;
  }

  /**
   * @param {String} msg
   */
  static debugLog(msg) {
    Utils.ifDebug(Config.Debug.Log, () => {
      console.log(msg);
    });
  }

  // --- Other ---

  /**
   * @param {Phaser.Geom.Point} from
   * @param {Phaser.Geom.Point} to
   * @param {Number} speed
   * @returns {Number}
   */
  static getTweenDuration(from, to, speed) {
    const dist = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);

    const time = (dist / speed) * 1000;
    return time;
  }

  /**
   * @param {Object} enumObj
   * @param {Number} value
   */
  static enumToString(enumObj, value) {
    for (let name in enumObj) {
      if (enumObj[name] == value) return name;
    }

    return `UNDEFINED (${value})`;
  }

  /**
   * @param {String} s
   * @returns {Boolean}
   */
  static stringIsDigit(s) {
    return !isNaN(s);
  }

  static runLoadingBar() {
    const progressBar = Here._.add.graphics();
    const progressBox = Here._.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);

    var width = Here._.cameras.main.width;
    var height = Here._.cameras.main.height;

    const loadingText = Here._.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: "Loading...",
      style: {
        font: "20px monospace",
        fill: "#ffffff",
      },
    });
    loadingText.setOrigin(0.5, 0.5);

    progressBox.fillRect((width - 320) / 2, (height - 50) / 2, 320, 50);

    Here._.load.on("progress", (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        (width - 300) / 2,
        (height - 30) / 2,
        300 * value,
        30,
      );
    });

    Here._.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  // --- New ---

  static colorNumberToString(hexNumber) {
    return "#" + hexNumber.toString(16).padStart(6, "0");
  }

  static indexToLetter(index) {
    return String.fromCharCode(65 + index);
  }

  static getDurationMaybeQuick(duration) {
    return Utils.isDebug(Config.Debug.QuickDelays) ? duration / 10 : duration;
  }

  static getSpeedMaybeQuick(speed) {
    return Utils.isDebug(Config.Debug.QuickDelays) ? speed * 10 : speed;
  }

  static EPS = 1e-9;

  static isEqualWithEps(a, b) {
    return Math.abs(a - b) < Utils.EPS;
  }

  static isPointOnSegment(px, py, x1, y1, x2, y2) {
    const cross = (px - x1) * (y2 - y1) - (py - y1) * (x2 - x1);
    if (Math.abs(cross) > Utils.EPS) return false;

    const dot = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
    if (dot < -Utils.EPS) return false;

    const squaredLen = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (dot - squaredLen > Utils.EPS) return false;

    return true;
  }

  static isPointAtDistanceFromEnds(px, py, x1, y1, x2, y2, dist) {
    const distToStart = Math.hypot(px - x1, py - y1);
    const distToEnd = Math.hypot(px - x2, py - y2);
    const segmentLength = Math.hypot(x2 - x1, y2 - y1);

    if (distToStart < dist + Utils.EPS || distToEnd < dist + Utils.EPS) {
      return false;
    }

    return Utils.isPointOnSegment(px, py, x1, y1, x2, y2);
  }

  static segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4, Dist = 5) {
    const len1 = Math.hypot(x2 - x1, y2 - y1);
    const len2 = Math.hypot(x4 - x3, y4 - y3);

    if (len1 < Utils.EPS || len2 < Utils.EPS) return false;

    const cross1 = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
    const cross2 = (x2 - x1) * (y4 - y1) - (y2 - y1) * (x4 - x1);
    const cross3 = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
    const cross4 = (x4 - x3) * (y2 - y3) - (y4 - y3) * (x2 - x3);

    const strictIntersection =
      cross1 * cross2 < -Utils.EPS && cross3 * cross4 < -Utils.EPS;

    if (strictIntersection) {
      const intersectionPoint = Utils.getIntersectionPoint(
        x1,
        y1,
        x2,
        y2,
        x3,
        y3,
        x4,
        y4,
      );
      if (intersectionPoint) {
        const [ix, iy] = intersectionPoint;
        const distToEnds1 = Math.min(
          Math.hypot(ix - x1, iy - y1),
          Math.hypot(ix - x2, iy - y2),
        );
        const distToEnds2 = Math.min(
          Math.hypot(ix - x3, iy - y3),
          Math.hypot(ix - x4, iy - y4),
        );

        if (
          distToEnds1 >= Dist - Utils.EPS &&
          distToEnds2 >= Dist - Utils.EPS
        ) {
          return true;
        }
      }
      return false;
    }

    const endpointOnSegment1 =
      (Dist <= 0 && Utils.isPointOnSegment(x1, y1, x3, y3, x4, y4)) ||
      (Dist > 0 &&
        Utils.isPointAtDistanceFromEnds(x1, y1, x3, y3, x4, y4, Dist)) ||
      (Dist <= 0 && Utils.isPointOnSegment(x2, y2, x3, y3, x4, y4)) ||
      (Dist > 0 &&
        Utils.isPointAtDistanceFromEnds(x2, y2, x3, y3, x4, y4, Dist));

    const endpointOnSegment2 =
      (Dist <= 0 && Utils.isPointOnSegment(x3, y3, x1, y1, x2, y2)) ||
      (Dist > 0 &&
        Utils.isPointAtDistanceFromEnds(x3, y3, x1, y1, x2, y2, Dist)) ||
      (Dist <= 0 && Utils.isPointOnSegment(x4, y4, x1, y1, x2, y2)) ||
      (Dist > 0 &&
        Utils.isPointAtDistanceFromEnds(x4, y4, x1, y1, x2, y2, Dist));

    if (endpointOnSegment1 || endpointOnSegment2) {
      const commonPoints = [
        [x1, y1],
        [x2, y2],
        [x3, y3],
        [x4, y4],
      ];

      const shared = [];
      for (let i = 0; i < commonPoints.length; i++) {
        const [px, py] = commonPoints[i];
        if (
          Utils.isPointOnSegment(px, py, x1, y1, x2, y2) &&
          Utils.isPointOnSegment(px, py, x3, y3, x4, y4)
        ) {
          shared.push([px, py]);
        }
      }

      const uniqueShared = [];
      for (const p of shared) {
        let duplicate = false;
        for (const q of uniqueShared) {
          if (
            Utils.isEqualWithEps(p[0], q[0]) &&
            Utils.isEqualWithEps(p[1], q[1])
          ) {
            duplicate = true;
            break;
          }
        }
        if (!duplicate) uniqueShared.push(p);
      }

      if (uniqueShared.length > 1) return true;

      if (uniqueShared.length === 1) {
        const [cx, cy] = uniqueShared[0];

        const distToEnds1 = Math.min(
          Math.hypot(cx - x1, cy - y1),
          Math.hypot(cx - x2, cy - y2),
        );
        const distToEnds2 = Math.min(
          Math.hypot(cx - x3, cy - y3),
          Math.hypot(cx - x4, cy - y4),
        );

        if (distToEnds1 < Dist - Utils.EPS || distToEnds2 < Dist - Utils.EPS) {
          return false;
        }

        let dir1x = 0,
          dir1y = 0;
        if (Utils.isEqualWithEps(x1, cx) && Utils.isEqualWithEps(y1, cy)) {
          dir1x = x2 - x1;
          dir1y = y2 - y1;
        } else if (
          Utils.isEqualWithEps(x2, cx) &&
          Utils.isEqualWithEps(y2, cy)
        ) {
          dir1x = x1 - x2;
          dir1y = y1 - y2;
        }

        let dir2x = 0,
          dir2y = 0;
        if (Utils.isEqualWithEps(x3, cx) && Utils.isEqualWithEps(y3, cy)) {
          dir2x = x4 - x3;
          dir2y = y4 - y3;
        } else if (
          Utils.isEqualWithEps(x4, cx) &&
          Utils.isEqualWithEps(y4, cy)
        ) {
          dir2x = x3 - x4;
          dir2y = y3 - y4;
        }

        const len1 = Math.hypot(dir1x, dir1y);
        const len2 = Math.hypot(dir2x, dir2y);

        if (len1 > Utils.EPS && len2 > Utils.EPS) {
          dir1x /= len1;
          dir1y /= len1;
          dir2x /= len2;
          dir2y /= len2;

          const dot = dir1x * dir2x + dir1y * dir2y;

          if (dot < -Utils.EPS) return false;
        }

        return true;
      }
    }

    return false;
  }

  static getIntersectionPoint(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < Utils.EPS) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      const ix = x1 + t * (x2 - x1);
      const iy = y1 + t * (y2 - y1);
      return [ix, iy];
    }

    return null;
  }
}
