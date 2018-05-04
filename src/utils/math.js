/**
 * @file Useful mathematical functions.
 */

/**
 * Round the given number to the nearest interval.
 *
 * @param {number} x
 * @param {number} interval
 * @return {number}
 */
export function round(x, interval) {
    return Math.round(x / interval) * interval;
}
