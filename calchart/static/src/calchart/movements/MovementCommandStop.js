var AnimationState = require("calchart/AnimationState");
var BaseMovementCommand = require("./BaseMovementCommand");
var JSUtils = require("utils/JSUtils");

/**
 * A MovementCommand which represents no motion.
 *
 * @param {float} startX -- the x-coordinate of the movement's start position
 * @param {float} startY -- the y-coordinate of the movement's start position
 * @param {float} orientation -- the direction toward which the dot will face,
 *   while moving, in Calchart degrees
 * @param {int} duration -- the duration of the movement, in beats
 * @param {boolean} isMarkTime -- true if marking time, false if close
 * @param {object} options -- options for the movement, including:
 *   - {int} beatsPerStep -- the number of beats per each step of the movement,
 *     only useful for marking time. (default 1)
 */
var MovementCommandStop = function(startX, startY, orientation, duration, isMarkTime, options) {
    this._orientation = orientation;
    this._isMarkTime = isMarkTime;
    this._beatsPerStep = JSUtils.get(options, "beatsPerStep", 1);

    BaseMovementCommand.call(this, startX, startY, startX, startY, duration);
};

JSUtils.extends(MovementCommandStop, BaseMovementCommand);

/**
 * Create a MovementCommandStop from the given serialized data
 *
 * @param {object} data -- the JSON data to initialize the
 *   MovementCommandStop with
 * @return {MovementCommandStop} the MovementCommandStop reconstructed
 *   from the given data
 */
MovementCommandStop.deserialize = function(data) {
    return new MovementCommandStop(
        data.startX,
        data.startY,
        data.orientation,
        data.duration,
        data.isMarkTime,
        data
    );
};

/**
 * Return the JSONified version of the MovementCommandStop
 *
 * @return {object} a JSON object containing this MovementCommandStop's data
 */
MovementCommandStop.prototype.serialize = function() {
    return {
        type: "MovementCommandStop",
        startX: this._startX,
        startY: this._startY,
        orientation: this._orientation,
        duration: this._duration,
        isMarkTime: this._isMarkTime,
        beatsPerStep: this._beatsPerStep,
    };
};

MovementCommandStop.prototype.getAnimationState = function(beatNum) {
    return new AnimationState(this.getStartPosition(), this._orientation);
};

/**
 * @return {string} the continuity text in the form "MT 4 E" or "Close"
 */
MovementCommandStop.prototype.getContinuityText = function() {
    if (this._isMarkTime) {
        return "Close";
    } else {
        var steps = this._duration / this._beatsPerStep;
        return "MT " + steps + " " + this.getOrientation();
    }
};

module.exports = MovementCommandStop;
