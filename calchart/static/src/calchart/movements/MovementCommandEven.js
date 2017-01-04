var JSUtils = require("utils/JSUtils");
var MathUtils = require("utils/MathUtils");
var MovementCommandMove = require("./MovementCommandMove");
 
/**
 * A MovementCommand which represents an even-step transition between two points.
 *
 * @param {float} startX -- the x-coordinate of the movement's start position
 * @param {float} startY -- the y-coordinate of the movement's start position
 * @param {float} endX -- the x-coordinate of the movement's end position
 * @param {float} endY -- the y-coordinate of the movement's end position
 * @param {float|null} orientation -- the direction toward which the dot will face,
 *   while moving, in Calchart degrees. If null, faces towards motion.
 * @param {int} duration -- the duration of the movement, in beats
 * @param {int} beatsPerStep -- the number of beats per each step of the movement
 */ 
var MovementCommandEven = function(startX, startY, endX, endY, orientation, duration, beatsPerStep) {
    var stepSize = MathUtils.calcDistance(startX, startY, endX, endY) / duration;
    var direction = MathUtils.calcAngle(startX, startY, endX, endY);

    if (orientation === null) {
        orientation = direction;
    }

    MovementCommandMove.call(this, startX, startY, stepSize, direction, orientation, duration, beatsPerStep);
};

JSUtils.extends(MovementCommandEven, MovementCommandMove);

/**
 * Create a MovementCommandEven from the given serialized data
 *
 * @param {object} data -- the JSON data to initialize the
 *   MovementCommandEven with
 * @return {MovementCommandEven} the MovementCommandEven reconstructed
 *   from the given data
 */
MovementCommandEven.deserialize = function(data) {
    return new MovementCommandEven(
        data.startX,
        data.startY,
        data.endX,
        data.endY,
        data.orientation,
        data.duration,
        data.beatsPerStep
    );
};

/**
 * Return the JSONified version of the MovementCommandEven
 *
 * @return {object} a JSON object containing this MovementCommandEven's data
 */
MovementCommandEven.prototype.serialize = function() {
    return {
        type: "MovementCommandEven",
        startX: this._startX,
        startY: this._startY,
        endX: this._endX,
        endY: this._endY,
        orientation: this._orientation,
        duration: this._duration,
        beatsPerStep: this._beatsPerStep,
    };
};

/**
 * @return {string} the continuity text in the form "Even 8 E, 4 S" or "Move 8 NE" if
 * in one direction
 */
MovementCommandEven.prototype.getContinuityText = function() {
    var deltaX = this._endX - this._startX;
    var deltaY = this._endY - this._startY;
    var dirX = (deltaX < 0) ? "S" : "N";
    var dirY = (deltaY < 0) ? "W" : "E";
    var steps = this._duration / this._beatsPerStep;
    deltaX = Math.abs(deltaX);
    deltaY = Math.abs(deltaY);

    // Check if movement only in one direction and same number of steps as change in position
    if (deltaX == 0 && deltaY == steps) {
        return "Move " + steps + " " + dirY;
    } else if (deltaY == 0 && deltaX == steps) {
        return "Move " + steps + " " + dirX;
    } else if (deltaY == deltaX && deltaX == steps) { // Diagonal
        return "Move " + steps + " " + dirX + dirY;
    }

    var text = "Even ";
    // If movement is a fraction of steps, simply say "NE" or "S"
    if (deltaX % 1 != 0 || deltaY % 1 != 0) {
        text += (deltaX != 0) ? dirX : "";
        text += (deltaY != 0) ? dirY : "";
    } else {
        // End result will be concat. of directions, e.g. "Even 8E, 4S"
        var moveTexts = [];
        if (deltaY != 0) {
            moveTexts.push(Math.abs(deltaY) + " " + dirY);
        }
        if (deltaX != 0) {
            moveTexts.push(Math.abs(deltaX) + " " + dirX);
        }
        text += moveTexts.join(", ");
    }
    // Error checking for an even move without movement in any direction
    if (text === "Even ") {
        text += "0";
    }
    return text + " (" + steps + " steps)";
};

module.exports = MovementCommandEven;
