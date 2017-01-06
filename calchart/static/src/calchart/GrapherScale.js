var Coordinate = require("calchart/Coordinate");
var MathUtils = require("utils/MathUtils");

/**
 * An object containing dimension and scale information for a
 * field in a Grapher.
 *
 * @param {Grapher} grapher -- the grapher to get the scale of
 * @param {float} svgWidth -- the width of the svg
 * @param {float} svgHeight -- the height of the svg
 * @param {float} padding -- the minimum amount of space between the
 *   field and the SVG
 */
var GrapherScale = function(grapher, svgWidth, svgHeight, padding) {
    // keep aspect ratio of width/height
    this.width = svgWidth - 2 * padding;
    this.height = this.width * grapher.FIELD_HEIGHT / grapher.FIELD_WIDTH;

    if (this.height > svgHeight) {
        this.height = svgHeight - 2 * padding;
        this.width = this.height * grapher.FIELD_WIDTH / grapher.FIELD_HEIGHT;
    }

    this.minX = (svgWidth - this.width) / 2;
    this.maxX = this.minX + this.width;
    this.minY = (svgHeight - this.height) / 2;
    this.maxY = this.minY + this.height;

    // function that maps steps to distance
    this.xScale = d3.scale.linear()
        .domain([0, grapher.FIELD_WIDTH])
        .range([this.minX, this.maxX]);

    // function that maps steps to distance
    this.yScale = d3.scale.linear()
        .domain([0, grapher.FIELD_HEIGHT])
        .range([this.minY, this.maxY]);

    // conversion ratio distance per step; ratio same for x and y axes
    this._ratio = this.xScale(1) - this.xScale(0);
};

/**
 * Get the scaled distance for the given number of steps
 *
 * @param {float} steps -- the number of steps to get the scaled distance
 * @return {float} the scaled distance represented by the given number of steps
 */
GrapherScale.prototype.toDistance = function(steps) {
    return this._ratio * steps;
};

/**
 * Convert the given coordinate from steps to distance
 *
 * @param {Coordinate} steps -- the number of steps to get the scaled distance
 * @return {Coordinate} the coordinate as distance from the origin of the SVG
 */
GrapherScale.prototype.toDistanceCoordinates = function(steps) {
    var x = this.toDistance(steps.x) + this.minX;
    var y = this.toDistance(steps.y) + this.minY;
    return new Coordinate(x, y);
};

/**
 * Get the number of steps for the given distance
 *
 * @param {float} distance -- the distance to measure in steps
 * @param {float} the number of steps represented by the given distance
 */
GrapherScale.prototype.toSteps = function(distance) {
    return distance / this._ratio;
};

/**
 * Convert the given coordinate from distance to steps
 *
 * @param {Coordinate} distance -- the scaled distance to convert to steps
 * @return {Coordinate} the coordinate as steps from the southwest corner of the field
 */
GrapherScale.prototype.toStepCoordinates = function(distance) {
    var x = this.toSteps(distance.x - this.minX);
    var y = this.toSteps(distance.y - this.minY);
    return new Coordinate(x, y);
};

module.exports = GrapherScale;
