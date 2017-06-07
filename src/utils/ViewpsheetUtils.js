/**
 * @file A collection of utility functions related to generating viewpsheets
 */

// in pixels, will be scaled when printing
export const PAGE_WIDTH = 800;
export const PAGE_HEIGHT = PAGE_WIDTH * 11 / 8.5;

// .25" margin for 8.5x11 page
export const PAGE_MARGIN = PAGE_WIDTH / 34;
export const WIDGET_MARGIN = 5;

// each quadrant corresponds with a stuntsheet
export const QUADRANT_HEIGHT = PAGE_HEIGHT / 2 - PAGE_MARGIN * 2;
export const QUADRANT_WIDTH = PAGE_WIDTH / 2 - PAGE_MARGIN * 2;

// (x,y) coordinates for each quadrant
export const LEFT_RIGHT_QUADRANTS = [
    {
        x: PAGE_MARGIN,
        y: PAGE_MARGIN,
    },
    {
        x: PAGE_WIDTH / 2 + PAGE_MARGIN,
        y: PAGE_MARGIN,
    },
    {
        x: PAGE_MARGIN,
        y: PAGE_HEIGHT / 2 + PAGE_MARGIN,
    },
    {
        x: PAGE_WIDTH / 2 + PAGE_MARGIN,
        y: PAGE_HEIGHT / 2 + PAGE_MARGIN,
    },
];
export const TOP_BOTTOM_QUADRANTS = [0, 2, 1, 3].map(i => LEFT_RIGHT_QUADRANTS[i]);

// font size of sheet label
export const LABEL_SIZE = 36;

// quadrant has four rows: label, dot continuity, individual continuity/movement,
// and nearby dots. WIDGET_HEIGHTS specifies the heights of widgets in the corresponding
// row. QUADRANT_ROWS specifies the y-coordinate of widgets in the corresponding
// row.
let totalHeight = QUADRANT_HEIGHT - LABEL_SIZE;
export const WIDGET_HEIGHTS = [
    LABEL_SIZE,
    totalHeight / 6,
    totalHeight / 3,
    totalHeight / 2,
];
export const QUADRANT_ROWS = _.reduce(WIDGET_HEIGHTS, (arr, height, i) => {
    arr.push(arr[i] + height);
    return arr;
}, [0]);

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
