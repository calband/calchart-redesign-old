/**
 * @file A collection of various utility functions and constants that are
 * useful in mathematical calculations. For explanations on the coordinate
 * system, see docs/Coordinate_System.md
 */
 
/** @const {float} */
export const PI_OVER_TWO = Math.PI / 2;

/** @const {float} */
export const TWO_PI = Math.PI * 2;

/**
 * Calculate the distance between two points
 *
 * @param {number} x1 - The x coordinate of the first point.
 * @param {number} y1 - The y coordinate of the first point.
 * @param {number} x2 - The x coordinate of the second point.
 * @param {number} y2 - The y coordinate of the second point.
 * @return {number} The distance between points (x1,y1) and (x2,y2).
 */
export function calcDistance(x1, y1, x2, y2) {
    let deltaX = x2 - x1;
    let deltaY = y2 - y1;
    return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
}

/**
 * Calculate the angle toward which the given vector is facing
 *
 * @param {number} x1 - The x coordinate of the vector's start.
 * @param {number} y1 - The y coordinate of the vector's start.
 * @param {number} x2 - The x coordinate of the vector's end.
 * @param {number} y2 - The y coordinate of the vector's end.
 * @return {number} The angle the vector (x1,y1) -> (x2,y2) is
 *   facing, in Calchart degrees.
 */
export function calcAngle(x1, y1, x2, y2) {
    let deltaX = x2 - x1;
    let deltaY = y2 - y1;
    let angle = Math.atan(-deltaX / deltaY);
    if (deltaY < 0) {
        angle += Math.PI;
    }
    return toDegrees(angle);
}

/**
 * Calculate the x position of a point rotated along the unit
 * circle by the given angle
 *
 * @param {number} angle - The angle to rotate the point, in Calchart
 *   degrees.
 * @return {number} The final x position of the point, rotated along the
 *   unit circle.
 */
export function calcRotatedXPos(angle) {
    return -Math.sin(toRadians(angle));
}

/**
 * Calculate the y position of a point rotated along the unit
 * circle by the given angle
 *
 * @param {number} angle - The angle to rotate the point, in Calchart
 *   degrees.
 * @return {number} The final y position of the point, rotated along the
 *   unit circle.
 */
export function calcRotatedYPos(angle) {
    return Math.cos(toRadians(angle));
}

/**
 * Rotate the given angle by a quarter-turn in the specified direction.
 *
 * @param {float} angle - The angle to rotate, in radians.
 * @param {boolean} isCW - true if the angle should be rotated
 *   clockwise; otherwise, rotate counter-clockwise.
 * @return The angle rotated by a quarter turn, in radians.
 */
export function quarterTurn(angle, isCW) {
    let orientation = isCW ? 1 : -1;
    return angle + orientation * PI_OVER_TWO;
}

/**
 * Round the given number to the nearest interval, rounding up.
 *
 * @param {float} x - The number to round.
 * @param {float} interval - The number to round to.
 * @return {float} x rounded to the nearest interval.
 */
export function round(x, interval) {
    return Math.round(x / interval) * interval;
}

/**
 * Round the given number to the nearest 1e-10 (for rounding
 * errors)
 *
 * @param {number} x - The number to round.
 * @return {number} x rounded to the nearest 1e-10.
 */
export function roundSmall(x) {
    return round(x, 1e-10);
}

/**
 * Convert an angle measured in degrees to one
 * measured in radians.
 *
 * @param {number} angle - The angle, measured in degrees.
 * @return {number} The angle, measured in radians.
 */
export function toRadians(angle) {
    return angle * Math.PI / 180;
}

/**
 * Converts an angle measured in radians to one
 * measured in degrees.
 *
 * @param {number} angle - The angle, measured in radians.
 * @return {number} The angle, measured in degrees.
 */
export function toDegrees(angle) {
    return angle * 180 / Math.PI;
}
