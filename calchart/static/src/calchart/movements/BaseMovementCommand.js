var CalchartUtils = require("utils/CalchartUtils");
var Coordinate = require("calchart/Coordinate");
var errors = require("calchart/errors");
var JSUtils = require("utils/JSUtils");

/**
 * Represents an individual movement that a dot executes during a
 * show. Needs to be subclassed by a class representing a specific
 * type of movement command.
 *
 * @param {int} startX -- the x-coordinate where the movement starts
 * @param {int} startY -- the y-coordinate where the movement starts
 * @param {int} endX -- the x-coordinate where the movement ends
 * @param {int} endY -- the y-coordinate where the movement ends
 * @param {int} duration -- the duration of the movement, in beats
 * @param {object} options -- options for most/all movements, including:
 *   - {float} orientation -- the direction toward which the dot will face,
 *     while moving, in Calchart degrees. (default undefined)
 *   - {int} beatsPerStep -- the number of beats per each step of the movement.
 *     (default 1)
 **/
var BaseMovementCommand = function(startX, startY, endX, endY, duration, options) {
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
    this._duration = duration;

    this._orientation = options.orientation;
    this._beatsPerStep = JSUtils.get(options, "beatsPerStep", 1);
};

/**
 * Return the JSONified version of this MovementCommand. The data needs
 * to define `type`, which is needed to deserialize (see
 * MovementCommand.deserialize)
 *
 * @return {object} a JSON object containing this MovementCommand's data
 */
BaseMovementCommand.prototype.serialize = function() {
    return {
        startX: this._startX,
        startY: this._startY,
        endX: this._endX,
        endY: this._endY,
        duration: this._duration,
        orientation: this._orientation,
        beatsPerStep: this._beatsPerStep,
    };
};

/**
 * Returns the position at which this movement starts
 *
 * @return {Coordinate} the position where the movement begins
 */
BaseMovementCommand.prototype.getStartPosition = function() {
    return new Coordinate(this._startX, this._startY);
};

/**
 * Returns the position at which this movement ends
 *
 * @return {Coordinate} the position where the movement ends
 */
BaseMovementCommand.prototype.getEndPosition = function() {
    return new Coordinate(this._endX, this._endY);
};

/**
 * Returns the number of beats required to complete this command
 *
 * @return {int} The duration of this command, in beats
 */
BaseMovementCommand.prototype.getDuration = function() {
    return this._duration;
};

/**
 * Returns this movement's orientation, if applicable.
 *
 * @return {string|undefined} the orientation of this movement, if
 *   applicable
 */
BaseMovementCommand.prototype.getOrientation = function() {
    if (this._orientation !== undefined) {
        return CalchartUtils.getOrientation(this._orientation);
    }
};

/**
 * Returns an AnimationState describing a dot who is executing this movement
 *
 * @param {int} beatNum -- the number of beats relative to the start of
 *   the movement
 * @return {AnimationState|null} An AnimationState that describes a dot at a
 *   moment of the show. If the Dot has no movement at the specified beat,
 *   returns null.
 */
BaseMovementCommand.prototype.getAnimationState = function(beatNum) {
    throw new errors.NotImplementedError(this);
};

/**
 * Returns the continuity text associated with this movement. Used for
 * individual continuities; use Continuity for dot type continuities
 *
 * @return {string} the text displayed for this movement
 */
BaseMovementCommand.prototype.getContinuityText = function() {
    throw new errors.NotImplementedError(this);
};

module.exports = BaseMovementCommand;
