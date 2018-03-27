/**
 * @file Defines classes for defining coordinates on the field.
 */

import Serializable from 'utils/Serializable';

class Coordinate extends Serializable {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super({}, {});

        this.x = x;
        this.y = y;
    }

    /**
     * @param {Object} data
     * @param {Show} show
     * @return {Coordinate}
     */
    static deserialize(data, show) {
        return new this(data.x, data.y);
    }

    /**
     * @return {Object}
     */
    _serialize() {
        return {
            x: this.x,
            y: this.y,
        };
    }
}

/**
 * A dot's position in pixels. `x` is the number of pixels from the left edge
 * and `y` is the number of pixels from the top edge.
 */
export class PixelCoordinate extends Coordinate {}

/**
 * A dot's position in steps. `x` is the number of steps from the south endzone
 * and `y` is the number of steps from the west sideline.
 */
export class StepCoordinate extends Coordinate {}
