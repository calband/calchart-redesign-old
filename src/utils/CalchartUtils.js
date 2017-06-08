/**
 * @file A collection of utility functions related to charting or shows
 */

import { round } from "utils/MathUtils";

/** @const {Object} */
export const CONTINUITIES = {
    "Simple": {
        EWNS: "EWNS",
        NSEW: "NSEW",
        FM: "FM: Forward March",
    },
    "Stops": {
        MT: "MT: Mark Time",
        CL: "CL: Close",
    },
    "Off-Grid": {
        EVEN: "Even",
        DMHS: "DMHS",
        HSDM: "HSDM",
    },
    "Flows": {
        FTL: "FTL: Follow the Leader",
        CM: "CM: Counter March",
        TWO: "TWO: 2 Step",
        GT: "GT: Gate Turn",
        GV: "GV: Grapevine",
    },
};

/** @const {Object.<string, string>} */
export const DEFAULT_CUSTOM = {
    default: "Default",
    custom: "Custom",
};

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
export const FIELD_TYPES = {
    default: "Default",
    college: "College Field",
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

/** @const {number[]} **/
export const ZOOMS = [0.5, 0.75, 1, 1.5, 2];

/** @const {Object.<string, string>} */
export const SHOW_FIELD_TYPES = _.clone(FIELD_TYPES);
delete SHOW_FIELD_TYPES.default;

/** @const {Object.<string, string>} */
export const SHOW_ORIENTATIONS = _.clone(ORIENTATIONS);
delete SHOW_ORIENTATIONS.default;

/** @const {Object.<string, string>} */
export const SHOW_STEP_TYPES = _.clone(STEP_TYPES);
delete SHOW_STEP_TYPES.default;

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

/**
 * Convert the given y-coordinate to a human-readable format; e.g.
 * "8E EH" would mean "8 steps east of the east hash".
 *
 * @param {number} y
 * @return {string}
 */
export function getYCoordinateText(y) {
    let round10 = y => round(y, 0.1);

    // West Sideline
    if (y == 0) {
        return "WS";
    }
    // Near West Sideline
    if (y <= 16) {
        return round10(y) + " WS";
    }
    // West of West Hash
    if (y < 32) {
        return round10(32 - y) + "W WH";
    }
    // West Hash
    if (y == 32) {
        return "WH";
    }
    // East of West Hash
    if (y <= 40) {
        return round10(y - 32) + "E WH";
    }
    // West of East Hash
    if (y < 52) {
        return round10(52 - y) + "W EH";
    }
    // East Hash
    if (y == 52) {
        return "EH";
    }
    // East of East Hash
    if (y <= 68) {
        return round10(y - 52) + "E EH";
    }
    // Near East Sideline
    if (y < 84) {
        return round10(84 - y) + " ES";
    }
    // East Sideline
    return "ES";
}
