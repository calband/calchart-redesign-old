/**
 * @file Defines classes for defining coordinates on the field.
 */

import Serializable from 'utils/Serializable';

class Coordinate extends Serializable {
    /**
     * Can either initialize as a data object or as the coordinate pair.
     *
     * @param {Object} data
     *  | {number} x
     *  | {number} y
     */
    constructor(data) {
        if (arguments.length == 2) {
            data = {
                x: arguments[0],
                y: arguments[1],
            };
        }

        super(data, {
            x: 'number',
            y: 'number',
        });
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
