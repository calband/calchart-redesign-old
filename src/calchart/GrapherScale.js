import Coordinate from "calchart/Coordinate";

/**
 * An object containing dimension and scale information for a Grapher.
 */
export default class GrapherScale {
    /**
     * @param {FieldGrapher} grapher - The grapher to get the scale of.
     * @param {number} svgWidth - The width of the svg.
     * @param {number} svgHeight - The height of the svg.
     * @param {number} paddingWidth - The minimum amount of space between
     *   the sides of the field and the SVG.
     * @param {number} paddingHeight - The minimum amount of space between
     *   the top and bottom of the field and the SVG.
     */
    constructor(grapher, svgWidth, svgHeight, paddingWidth, paddingHeight) {
        // the width/height of the field
        this._width = svgWidth - 2 * paddingWidth;
        this._height = this._width * grapher.FIELD_HEIGHT / grapher.FIELD_WIDTH;

        // keep aspect ratio of width/height
        if (this._height > svgHeight) {
            this._height = svgHeight - 2 * paddingHeight;
            this._width = this._height * grapher.FIELD_WIDTH / grapher.FIELD_HEIGHT;
        }

        // pixels to the edges of the field
        this._minX = (svgWidth - this._width) / 2;
        this._maxX = this._minX + this._width;
        this._minY = (svgHeight - this._height) / 2;
        this._maxY = this._minY + this._height;

        // function that maps steps to distance
        this._xScale = d3.scaleLinear()
            .domain([0, grapher.FIELD_WIDTH])
            .range([this.minX, this.maxX]);

        // function that maps steps to distance
        this._yScale = d3.scaleLinear()
            .domain([0, grapher.FIELD_HEIGHT])
            .range([this.minY, this.maxY]);

        // conversion ratio distance per step; ratio same for x and y axes
        this._ratio = this.xScale(1) - this.xScale(0);
    };

    get width() { return this._width; }
    get height() { return this._height; }
    get minX() { return this._minX; }
    get maxX() { return this._maxX; }
    get minY() { return this._minY; }
    get maxY() { return this._maxY; }
    get xScale() { return this._xScale; }
    get yScale() { return this._yScale; }

    /**
     * Get the scaled distance for the given number of steps.
     *
     * @param {number} steps
     * @return {number}
     */
    toDistance(steps) {
        return this._ratio * steps;
    }

    /**
     * Get the number of steps for the given distance.
     *
     * @param {number} distance
     * @return {number}
     */
    toSteps(distance) {
        return distance / this._ratio;
    }

    /**
     * Convert the given coordinate from steps to distance.
     *
     * @param {(Coordinate|Object)} steps - The coordinate to convert, either
     *   a Coordinate object or an object that has x and y defined.
     * @return {Coordinate}
     */
    toDistanceCoordinates(steps) {
        let x = this.toDistance(steps.x) + this.minX;
        let y = this.toDistance(steps.y) + this.minY;
        return new Coordinate(x, y);
    }

    /**
     * Convert the given coordinate from distance to steps.
     *
     * @param {(Coordinate|Object)} distance - The coordinate to convert, either
     *   a Coordinate object or an object that has x and y defined.
     * @return {Coordinate}
     */
    toStepCoordinates(distance) {
        let x = this.toSteps(distance.x - this.minX);
        let y = this.toSteps(distance.y - this.minY);
        return new Coordinate(x, y);
    }
}
