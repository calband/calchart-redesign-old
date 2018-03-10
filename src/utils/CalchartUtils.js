/**
 * @file A collection of utility functions related to charting or shows.
 */

import { round } from 'lodash';

/** @const {string[]} */
export const AUDIO_EXTENSIONS = ['ogg'];

/** @const {Object} */
export const CONTINUITIES = {
    'Simple': {
        EWNS: 'EWNS',
        NSEW: 'NSEW',
        FM: 'FM: Forward March',
    },
    'Stops': {
        MT: 'MT: Mark Time',
        CL: 'CL: Close',
    },
    'Off-Grid': {
        EVEN: 'Even',
        DMHS: 'DMHS',
        HSDM: 'HSDM',
    },
    'Flows': {
        FTL: 'FTL: Follow the Leader',
        CM: 'CM: Counter March',
        TWO: 'TWO: 2 Step',
        GT: 'GT: Gate Turn',
        GV: 'GV: Grapevine',
    },
};

/** @const {Object.<string, string>} */
export const DEFAULT_CUSTOM = {
    default: 'Default',
    custom: 'Custom',
};

/** @const {Object.<string, string>} */
export const ENDINGS = {
    MT: 'Mark Time',
    CL: 'Close',
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

/** @const {number[]} **/
export const ZOOMS = [0.5, 0.75, 1, 1.5, 2];

/**
 * Convert the given y-coordinate to a human-readable format; e.g.
 * '8E EH' would mean '8 steps east of the east hash'.
 *
 * @param {number} y
 * @return {string}
 */
export function getYCoordinateText(y) {
    let round10 = y => round(y, 1);

    // West Sideline
    if (y == 0) {
        return 'WS';
    }
    // Near West Sideline
    if (y <= 16) {
        return round10(y) + ' WS';
    }
    // West of West Hash
    if (y < 32) {
        return round10(32 - y) + 'W WH';
    }
    // West Hash
    if (y == 32) {
        return 'WH';
    }
    // East of West Hash
    if (y <= 40) {
        return round10(y - 32) + 'E WH';
    }
    // West of East Hash
    if (y < 52) {
        return round10(52 - y) + 'W EH';
    }
    // East Hash
    if (y == 52) {
        return 'EH';
    }
    // East of East Hash
    if (y <= 68) {
        return round10(y - 52) + 'E EH';
    }
    // Near East Sideline
    if (y < 84) {
        return round10(84 - y) + ' ES';
    }
    // East Sideline
    return 'ES';
}
