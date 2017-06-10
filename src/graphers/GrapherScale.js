import Coordinate from "calchart/Coordinate";

/**
 * An object containing dimension and scale information for a Grapher.
 */
export default class GrapherScale {
    /**
     * @param {FieldGrapher} grapher - The grapher to get the scale of.
     * @param {number} svgWidth - The width of the svg.
     * @param {number} svgHeight - The height of the svg.
     * @param {Object} options - The options to customize drawing the field.
     *   See Grapher.setOption for a list of all available options.
     */
    constructor(grapher, svgWidth, svgHeight, options) {
        // the width/height of the field
        this._width = svgWidth - 2 * options.fieldPadding;
        this._height = this._width * grapher.FIELD_HEIGHT / grapher.FIELD_WIDTH;

        // keep aspect ratio of width/height
        if (this._height > svgHeight) {
            this._height = svgHeight - 2 * options.fieldPadding;
            this._width = this._height * grapher.FIELD_WIDTH / grapher.FIELD_HEIGHT;
        }

        // just in case
        this._width = Math.max(this._width, 0);
        this._height = Math.max(this._height, 0);

        // pixels to the edges of the field
        this._minX = (svgWidth - this._width) / 2;
        this._maxX = this._minX + this._width;
        this._minY = (svgHeight - this._height) / 2;
        this._maxY = this._minY + this._height;

        // function that maps steps to distance
        this._xScale = d3.scaleLinear()
            .domain([0, grapher.FIELD_WIDTH])
            .range([this._minX, this._maxX]);

        // function that maps steps to distance
        this._yScale = d3.scaleLinear()
            .domain([0, grapher.FIELD_HEIGHT])
            .range([this._minY, this._maxY]);

        // conversion ratio distance per step; ratio same for x and y axes
        this._ratio = this.xScale(1) - this.xScale(0);

        // true if east up
        this._eastUp = options.eastUp;
    }

    get width() { return this._width; }
    get height() { return this._height; }

    get minX() { return this._minX; }
    get maxX() { return this._maxX; }
    get minY() { return this._minY; }
    get maxY() { return this._maxY; }

    get xScale() { return this._xScale; }
    get yScale() { return this._yScale; }

    /**
     * Convert the input into distance. If the input is a number, return
     * the scaled distance for the given number of steps. If the input
     * is a Coordinate-like object, convert the coordinate from steps to
     * distance.
     *
     * @param {(number|Coordinate)} steps
     * @return {(number|Coordinate)}
     */
    toDistance(steps) {
        if (_.isNumber(steps)) {
            return steps * this._ratio;
        } else {
            let x = this.toDistanceX(steps.x);
            let y = this.toDistanceY(steps.y);
            return new Coordinate(x, y);
        }
    }

    /**
     * Convert the given x-coordinate from steps to distance.
     *
     * @param {number} steps
     * @return {number}
     */
    toDistanceX(steps) {
        let distance = this.toDistance(steps);
        if (this._eastUp) {
            return this.maxX - distance;
        } else {
            return this.minX + distance;
        }
    }

    /**
     * Convert the given y-coordinate from steps to distance.
     *
     * @param {number} steps
     * @return {number}
     */
    toDistanceY(steps) {
        let distance = this.toDistance(steps);
        if (this._eastUp) {
            return this.maxY - distance;
        } else {
            return this.minY + distance;
        }
    }

    /**
     * Convert the input into steps. If the input is a number, return
     * the number of steps for the given distance. If the input is a
     * Coordinate-like object, convert the coordinate from distance to steps.
     *
     * @param {(number|Coordinate)} distance
     * @return {(number|Coordinate)}
     */
    toSteps(distance) {
        if (_.isNumber(distance)) {
            return distance / this._ratio;
        } else {
            let x = this.toStepsX(distance.x);
            let y = this.toStepsY(distance.y);
            return new Coordinate(x, y);
        }
    }

    /**
     * Convert the given x-coordinate from distance to steps.
     *
     * @param {number} distance
     * @return {number}
     */
    toStepsX(distance) {
        if (this._eastUp) {
            distance = distance + this.maxX;
        } else {
            distance = distance - this.minX;
        }
        return this.toSteps(distance);
    }

    /**
     * Convert the given y-coordinate from distance to steps.
     *
     * @param {number} distance
     * @return {number}
     */
    toStepsY(distance) {
        if (this._eastUp) {
            distance = distance + this.maxY;
        } else {
            distance = distance - this.minY;
        }
        return this.toSteps(distance);
    }
}
