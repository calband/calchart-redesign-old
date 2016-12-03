/**
 * Contains all utility functions related to charting or shows
 */
var CalchartUtils = {};

/**
 * The multiplier for converting steps into standard step sizes.
 * @type {float}
 */
CalchartUtils.STEP_SIZES = {
    STANDARD: 8/8,
    TUNNEL: 8/6,
    DIAGONAL: Math.SQRT2,
};

/**
 * Returns the orientation of the given angle. Will return a single
 * direction (E,S,W,N) if the angle is exactly 0/90/180/270, otherwise
 * will return a compound direction (SE,SW,NW,NE).
 *
 * @param {float} angle -- the angle, in Calchart degrees
 * @return {String} the orientation
 */
CalchartUtils.getOrientation = function(angle) {
    switch (angle) {
        case 0:
            return "E";
        case 90:
            return "S";
        case 180:
            return "W";
        case 270:
            return "N";
    }

    if (angle < 90) {
        return "SE";
    } else if (angle < 180) {
        return "SW";
    } else if (angle < 270) {
        return "NW";
    } else {
        return "NE";
    }
};

module.exports = CalchartUtils;
