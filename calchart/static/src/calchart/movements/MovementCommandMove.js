var AnimationState = require("calchart/AnimationState");
var BaseMovementCommand = require("./BaseMovementCommand");
var CalchartUtils = require("utils/CalchartUtils");
var Coordinate = require("calchart/Coordinate");
var JSUtils = require("utils/JSUtils");
var MathUtils = require("utils/MathUtils");
 
/**
 * A MovementCommand which represents a constant movement in the given direction.
 *
 * @param {float} startX -- the x-coordinate of the movement's start position
 * @param {float} startY -- the y-coordinate of the movement's start position
 * @param {float} direction -- the direction toward which the dot will move,
 *   in Calchart degrees
 * @param {int} duration -- the duration of the movement, in beats
 * @param {object} options -- options for the movement, including:
 *   - {float} stepSize -- the multiplier for converting steps into standard step
 *     sizes. See CalchartUtils.STEP_SIZES. (default CalchartUtils.STEP_SIZES.STANDARD)
 *   - {float} orientation -- default same as direction
 *   - {int} beatsPerStep
 */ 
var MovementCommandMove = function(startX, startY, direction, duration, options) {
    this._stepSize = JSUtils.get(options, "stepSize", CalchartUtils.STEP_SIZES.STANDARD);
    options.orientation = JSUtils.get(options, "orientation", direction);

    this._direction = direction;
    this._deltaXPerStep = MathUtils.calcRotatedXPos(direction) * this._stepSize;
    this._deltaYPerStep = MathUtils.calcRotatedYPos(direction) * this._stepSize;

    BaseMovementCommand.call(this, startX, startY, null, null, duration, options);

    var end = this._getPosition(duration);
    this._endX = end.x;
    this._endY = end.y;
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
        data.direction,
        data.duration,
        data
    );
};

/**
 * Return the JSONified version of the MovementCommandMove
 *
 * @return {object} a JSON object containing this MovementCommandMove's data
 */
MovementCommandMove.prototype.serialize = function() {
    return $.extend(BaseMovementCommand.prototype.serialize.call(this), {
        type: "MovementCommandMove",
        direction: this._direction,
        stepSize: this._stepSize,
    });
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
    x = MathUtils.roundSmall(x);
    y = MathUtils.roundSmall(y);
    return new Coordinate(x, y);
};

/**
 * @return {string} the continuity text in the form "Move 4 E"
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
