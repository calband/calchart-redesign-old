/**
 * A Coordinate represents a dot's position on the field.
 */
class Coordinate {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Create a Coordinate from the given serialized data.
     *
     * @param {Object} data - The JSON data to initialize the Coordinate with.
     * @return {Coordinate}
     */
    static deserialize(data) {
        return new Coordinate(data.x, data.y);
    }

    /**
     * Return the JSONified version of the Coordinate.
     *
     * @return {Object}
     */
    serialize() {
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
