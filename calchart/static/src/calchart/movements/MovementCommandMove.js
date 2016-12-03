var AnimationState = require("../AnimationState");
var Coordinate = require("../Coordinate");
var JSUtils = require("../../utils/JSUtils");
var MathUtils = require("../../utils/MathUtils");
var BaseMovementCommand = require("./BaseMovementCommand");
 
/**
 * A MovementCommand which represents a constant movement in the given direction.
 *
 * @param {float} startX -- the x-coordinate of the movement's start position
 * @param {float} startY -- the y-coordinate of the movement's start position
 * @param {float} stepSize -- the multiplier for converting steps into standard
 *   step sizes. See CalchartUtils.STEP_SIZES
 * @param {float} direction -- the direction toward which the dot will move,
 *   in Calchart degrees
 * @param {float} orientation -- the direction toward which the dot will face,
 *   while moving, in Calchart degrees
 * @param {int} duration -- the duration of the movement, in beats
 * @param {int} beatsPerStep -- the number of beats per each step of the movement
 */ 
var MovementCommandMove = function(startX, startY, stepSize, direction, orientation, duration, beatsPerStep) {
    this._direction = direction;
    this._stepSize = stepSize;

    this._deltaXPerStep = MathUtils.calcRotatedXPos(direction) * stepSize;
    this._deltaYPerStep = MathUtils.calcRotatedYPos(direction) * stepSize;
    this._orientation = orientation;

    // defining again here for _getPosition
    this._startX = startX;
    this._startY = startY;
    this._beatsPerStep = beatsPerStep;

    var end = this._getPosition(duration);

    MovementCommand.call(this, startX, startY, end.x, end.y, duration);
};

JSUtils.extends(MovementCommandMove, BaseMovementCommand);

/**
 * Create a MovementCommandMove from the given serialized data
 *
 * @param {object} data -- the JSON data to initialize the
 *   MovementCommandMove with
 * @return {MovementCommandMove} the MovementCommandMove reconstructed
 *   from the given data
 */
MovementCommandMove.deserialize = function(data) {
    return new MovementCommandMove(
        data.startX,
        data.startY,
        data.stepSize,
        data.direction,
        data.orientation,
        data.duration,
        data.beatsPerStep,
    );
};

/**
 * Return the JSONified version of the MovementCommandMove
 *
 * @return {object} a JSON object containing this MovementCommandMove's data
 */
MovementCommandMove.prototype.serialize = function() {
    return {
        type: "MovementCommandMove",
        startX: this._startX,
        startY: this._startY,
        stepSize: this._stepSize,
        direction: this._direction,
        orientation: this._orientation,
        duration: this._duration,
        beatsPerStep: this._beatsPerStep,
    };
};

MovementCommandMove.prototype.getAnimationState = function(beatNum) {
    var position = this._getPosition(beatNum);
    return new AnimationState(position, this._orientation);
};

/**
 * Get the coordinate the dot will be at at the given beat
 *
 * @param {int} beatNum -- the number of beats relative to the start of the movement
 * @return {Coordinate} the position of the dot
 */
MovementCommandMove.prototype._getPosition = function(beatNum) {
    var numSteps = Math.floor(beatNum / this._beatsPerStep);
    var x = this._startX + this._deltaXPerStep * numSteps;
    var y = this._startY + this._deltaYPerStep * numSteps;
    return new Coordinate(x, y);
};

/**
 * @return {String} the continuity text in the form "Move 4 E"
 */
MovementCommandMove.prototype.getContinuityText = function() {
    var deltaX = this._endX - this._startX;
    var deltaY = this._endY - this._startY;
    var dirX = (deltaX < 0) ? "S" : "N";
    var dirY = (deltaY < 0) ? "W" : "E";
    // This movement can only move in one direction
    if (deltaX == 0) {
        return "Move " + Math.abs(deltaY) + " " + dirY;
    } else {
        return "Move " + Math.abs(deltaX) + " " + dirX;
    }
};

module.exports = MovementCommandMove;
