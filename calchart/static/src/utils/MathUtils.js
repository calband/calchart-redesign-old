/**
 * A collection of various utility functions and constants that are
 * useful in mathematical calculations. For explanations on the coordinate
 * system, see docs/Coordinate_System.md
 */
var MathUtils = {};
 
/**
 * π/2
 * @type {float}
 */
MathUtils.PI_OVER_TWO = Math.PI / 2;

/**
 * 2π
 * @type {float}
 */
MathUtils.TWO_PI = Math.PI * 2;

/**
 * Calculates the distance between two points
 *
 * @param {float} x1 -- the x coordinate of the first point
 * @param {float} y1 -- the y coordinate of the first point
 * @param {float} x2 -- the x coordinate of the second point
 * @param {float} y2 -- the y coordinate of the second point
 * @return {float} the distance between points (x1,y1) and (x2,y2)
 */
MathUtils.calcDistance = function(x1, y1, x2, y2) {
    var deltaX = x2 - x1;
    var deltaY = y2 - y1;
    return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
};

/**
 * Calculates the angle toward which the given vector is facing
 *
 * @param {float} x1 -- the x coordinate of the vector's start
 * @param {float} y1 -- the y coordinate of the vector's start
 * @param {float} x2 -- the x coordinate of the vector's end
 * @param {float} y2 -- the y coordinate of the vector's end
 * @return {float} the angle the vector (x1,y1) -> (x2,y2) is
 *   facing, in Calchart degrees
 */
MathUtils.calcAngle = function(x1, y1, x2, y2) {
    var deltaX = x2 - x1;
    var deltaY = y2 - y1;
    var angle = Math.atan(-deltaX / deltaY);
    if (deltaY < 0) {
        angle += Math.PI;
    }
    return this.toDegrees(angle);
};

/**
 * Calculates the x position of a point rotated along the unit
 * circle by the given angle
 *
 * @param {float} angle -- the angle to rotate the point, in Calchart
 *   degrees
 * @return {float} the final x position of the point, rotated along the
 *   unit circle
 */
MathUtils.calcRotatedXPos = function(angle) {
    return -Math.sin(this.toRadians(angle));
};

/**
 * Calculates the y position of a point rotated along the unit
 * circle by the given angle
 *
 * @param {float} angle -- the angle to rotate the point, in Calchart
 *   degrees
 * @return {float} the final y position of the point, rotated along the
 *   unit circle
 */
MathUtils.calcRotatedYPos = function(angle) {
    return Math.cos(this.toRadians(angle));
};

/**
 * Rotates an angle by a quarter-turn in a specified direction.
 *
 * @param {float} angle -- the angle to rotate, in radians
 * @param {boolean} isCW -- true if the angle should be rotated
 *   clockwise; otherwise, rotate counter-clockwise
 * @return the angle rotated by a quarter turn, in radians
 */
MathUtils.quarterTurn = function(angle, isCW) {
    var orientation = isCW ? 1 : -1;
    return angle + orientation * this.PI_OVER_TWO;
};

/**
 * Converts an angle measured in degrees to one
 * measured in radians.
 *
 * @param {float} angle An angle, measured in degrees.
 * @return {float} The angle, measured in radians.
 */
MathUtils.toRadians = function(angle) {
    return angle * Math.PI / 180;
};

/**
 * Converts an angle measured in radians to one
 * measured in degrees.
 *
 * @param {float} angle An angle, measured in radians.
 * @return {float} The angle, measured in degrees.
 */
MathUtils.toDegrees = function(angle) {
    return angle * 180 / Math.PI;
};

module.exports = MathUtils;
