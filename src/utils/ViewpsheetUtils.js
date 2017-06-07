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
    totalHeight / 5,
    totalHeight * 2/5,
    totalHeight * 2/5,
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

/**
 * Draw a dot within the given container.
 *
 * @param {D3} container - The <g> element to draw the dot in.
 * @param {number} dotRadius
 * @param {DotType} dotType
 */
export function drawDot(container, dotRadius, dotType) {
    let dot = container.append("circle")
        .attr("cx", dotRadius)
        .attr("cy", dotRadius)
        .attr("r", dotRadius);
    if (dotType.match(/plain/)) {
        dot.attr("fill", "none");
        dot.attr("stroke", "black");
    }
    if (dotType.match(/forwardslash|x/)) {
        container.append("line")
            .attr("stroke", "black")
            .attr("x1", 0)
            .attr("y1", dotRadius * 2)
            .attr("x2", dotRadius * 2)
            .attr("y2", 0);
    }
    if (dotType.match(/backslash|x/)) {
        container.append("line")
            .attr("stroke", "black")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", dotRadius * 2)
            .attr("y2", dotRadius * 2);
    }
}

/**
 * Write the given lines in the given container.
 *
 * @param {D3} container - A <text> element to write in.
 * @param {string[]} lines - Each line will be written below the
 *   previous line.
 * @param {number} [wrap] - If given, the width of the container to
 *   wrap text at.
 */
export function writeLines(container, lines, wrap) {
    let lineNumber = -1;
    function newline() {
        lineNumber++;
        // how far each line is from the previous line
        let dy = lineNumber === 0 ? 0 : 1.2;
        return container.append("tspan")
            .attr("x", container.attr("x"))
            .attr("dy", `${dy}em`);
    }

    if (_.isUndefined(wrap)) {
        lines.forEach(line => {
            newline().text(line);
        });
        return;
    }

    // split up lines containing "\n", and split each line into list of words
    lines = _.flatMap(lines, line => line.split("\n").map(line => line.split(" ")));

    lines.forEach(words => {
        let buffer = [];
        let line = newline();
        words.forEach(word => {
            buffer.push(word);
            line.text(buffer.join(" "));
            if (line.node().getComputedTextLength() > wrap) {
                buffer.pop();
                line.text(buffer.join(" "));
                buffer = [word];
                line = newline();
            }
        });
    });
}
