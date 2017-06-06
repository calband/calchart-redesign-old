/**
 * @file A collection of utility functions related to generating viewpsheets
 */

// in pixels, will be scaled when printing
export const PAGE_WIDTH = 800;

export const PAGE_HEIGHT = PAGE_WIDTH * 11 / 8.5;

// .25" margin for 8.5x11 page
export const MARGIN = PAGE_WIDTH / 34;

export const QUADRANT_HEIGHT = PAGE_HEIGHT / 2 - MARGIN * 2;
export const QUADRANT_WIDTH = PAGE_WIDTH / 2 - MARGIN * 2;

export const LEFT_RIGHT_QUADRANTS = [
    {
        x: MARGIN,
        y: MARGIN,
    },
    {
        x: PAGE_WIDTH / 2 + MARGIN,
        y: MARGIN,
    },
    {
        x: MARGIN,
        y: PAGE_HEIGHT / 2 + MARGIN,
    },
    {
        x: PAGE_WIDTH / 2 + MARGIN,
        y: PAGE_HEIGHT / 2 + MARGIN,
    },
];

export const TOP_BOTTOM_QUADRANTS = [0, 2, 1, 3].map(i => LEFT_RIGHT_QUADRANTS[i]);

export const ORIENTATIONS = {
    default: "Default",
    east: "Always East",
    west: "Always West",
};

/**
 * Align the given <text> element according to the given parameters. By default,
 * <text> elements are aligned on the bottom-right corner.
 *
 * @param {D3} text
 * @param {string} vertical - top|bottom
 * @param {string} horizontal - left|center|right
 */
let alignVertical = {
    top: "text-before-edge",
    bottom: "text-after-edge",
};
let alignHorizontal = {
    left: "start",
    center: "middle",
    right: "end",
};
export function align(text, vertical, horizontal) {
    let baseline = alignVertical[vertical];
    let anchor = alignHorizontal[horizontal];
    text.attr("dominant-baseline", baseline).attr("text-anchor", anchor);
}
