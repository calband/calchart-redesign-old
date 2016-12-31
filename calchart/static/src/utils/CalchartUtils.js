/**
 * Contains all utility functions related to charting or shows
 */
var CalchartUtils = {};

/**** CONSTANTS ****/

/* Options for direction */
CalchartUtils.DIRECTIONS = {
    0: "E",
    90: "S",
    180: "W",
    270: "N",
};

/* Options for ending a move */
CalchartUtils.ENDINGS = {
    MT: "Mark Time",
    CL: "Close",
};

/* Multipliers for converting steps into standard step sizes */
CalchartUtils.STEP_SIZES = {
    STANDARD: 8/8,
    TUNNEL: 8/6,
    DIAGONAL: Math.SQRT2,
};

/* Options for step types */
CalchartUtils.STEP_TYPES = {
    default: "Default",
    HS: "High Step",
    MM: "Mini Military",
    FF: "Full Field",
    SH: "Show High",
    JS: "Jerky Step",
};

/**** UTILITIES ****/

/**
 * Returns the orientation of the given angle. Will return a single
 * direction (E,S,W,N) if the angle is exactly 0/90/180/270, otherwise
 * will return a compound direction (SE,SW,NW,NE).
 *
 * @param {float} angle -- the angle, in Calchart degrees
 * @return {string} the orientation
 */
CalchartUtils.getOrientation = function(angle) {
    var dir = "";
    if (angle > 0 && angle < 180) {
        dir = "S";
    } else if (angle > 180 && angle < 360) {
        dir = "N";
    }

    if (angle < 90 || angle > 270) {
        return dir + "E";
    } else if (angle > 90 && angle < 270) {
        return dir + "W";
    } else {
        return dir;
    }
};

/**
 * Returns the nearest orientation of the given angle, which will be selected
 * and colored in the CSS.
 *
 * @param {float} angle -- the angle, in Calchart degrees
 * @return {string} one of: "facing-east", "facing-south", "facing-west", "facing-north"
 */
CalchartUtils.getNearestOrientation = function(angle) {
    // exactly half counts as east/west
    if (angle <= 45 || angle >= 315) {
        return "facing-east";
    } else if (angle < 135) {
        return "facing-south";
    } else if (angle <= 225) {
        return "facing-west";
    } else {
        return "facing-north";
    }
};

module.exports = CalchartUtils;
