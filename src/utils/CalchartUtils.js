/**
 * @file A collection of utility functions related to charting or shows
 */

/** @const {Object.<string, string>} */
export const DIRECTIONS = {
    0: "E",
    90: "S",
    180: "W",
    270: "N",
};

/** @const {Object.<string, string>} */
export const DOT_FORMATS = {
    combo: "A0, A1, A2, ...",
    number: "1, 2, 3, ...",
};

/** @const {Object.<string, string>} */
export const ENDINGS = {
    MT: "Mark Time",
    CL: "Close",
};

/** @const {Object.<string, string>} */
export const ORIENTATIONS = {
    default: "Default",
    east: "East",
    west: "West",
};

/**
 * Multipliers for converting steps into standard step sizes
 * @const {Object.<string, number>}
 */
export const STEP_SIZES = {
    STANDARD: 8/8,
    TUNNEL: 8/6,
    DIAGONAL: Math.SQRT2,
};

/** @const{Object.<string, string>} */
export const STEP_TYPES = {
    default: "Default",
    HS: "High Step",
    MM: "Mini Military",
    FF: "Full Field",
    SH: "Show High",
    JS: "Jerky Step",
};

/**
 * Return the dot labels for the given number of dots.
 *
 * @param {string} dotFormat - The format of the label. @see DOT_FORMATS.
 * @param {int} numDots - The number of dots to make labels for.
 * @return {string[]} The labels of the dots.
 */
export function getDotLabels(dotFormat, numDots) {
    let getLabel;
    switch (dotFormat) {
        case "combo":
            getLabel = function(n) {
                // 65 = "A"
                let charCode = 65 + (n / 10);
                let num = n % 10;
                return String.fromCharCode(charCode) + num;
            };
            break;
        case "number":
            getLabel = function(n) {
                return String(n);
            };
            break;
        default:
            throw new Error("Invalid dot format: ${dotFormat}");
    }

    return _.range(numDots).map(getLabel);
}

/**
 * Return the nearest orientation of the given angle, which will be selected
 * and colored in the CSS.
 *
 * @param {number} angle - The angle, in Calchart degrees
 * @return {string} one of: "facing-east", "facing-south", "facing-west", "facing-north"
 */
export function getNearestOrientation(angle) {
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
}

/**
 * Return the orientation of the given angle. Will return a single
 * direction (E,S,W,N) if the angle is exactly 0/90/180/270, otherwise
 * will return a compound direction (SE,SW,NW,NE).
 *
 * @param {number} angle - The angle, in Calchart degrees.
 * @return {string}
 */
export function getOrientation(angle) {
    let dir = "";
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
}
