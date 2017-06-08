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
export const SHEET_LABEL_SIZE = 36;
// font size of east sideline label
export const EAST_LABEL_SIZE = 10;

// heights of the widgets, not including any margins. each widget should
// space itself out from relevant borders.
let totalHeight = QUADRANT_HEIGHT - SHEET_LABEL_SIZE;
let widgetHeights = [
    SHEET_LABEL_SIZE,
    totalHeight * 1/5,
    totalHeight * 2/5,
    totalHeight * 2/5,
];

// information for the dot continuities widget
export const dotTypeWidget = {
    x: 0,
    y: widgetHeights[0] + WIDGET_MARGIN,
    width: QUADRANT_WIDTH,
    height: widgetHeights[1] - 2 * WIDGET_MARGIN,
};

// information for the individual continuities widget
export const individualWidget = {
    x: 0,
    y: dotTypeWidget.y + dotTypeWidget.height + WIDGET_MARGIN,
    width: QUADRANT_WIDTH / 2 - WIDGET_MARGIN,
    height: widgetHeights[2] - 2 * WIDGET_MARGIN,
};

// information for the movement diagram widget
export const movementWidget = _.extend({}, individualWidget, {
    x: QUADRANT_WIDTH / 2 + WIDGET_MARGIN,
    // account for east label
    height: individualWidget.height - EAST_LABEL_SIZE - 2,
});

// information for the nearby dots widget
export const nearbyWidget = {
    x: 0,
    y: individualWidget.y + individualWidget.height + WIDGET_MARGIN,
    width: QUADRANT_WIDTH,
    height: widgetHeights[3] - WIDGET_MARGIN,
};

export const ORIENTATIONS = {
    default: "Same as stuntsheet",
    east: "Always East Up",
    west: "Always West Up",
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
 * Move the given element to the given location. Can either provide
 * the location as an object containing keys for x and y or as
 * separate parameters.
 *
 * @param {D3} element
 * @param {object} position
 * @param {number} x
 * @param {number} y
 */
export function move(element, x, y) {
    if (arguments.length === 2) {
        x = arguments[1].x;
        y = arguments[1].y;
    }
    element.attr("transform", `translate(${x}, ${y})`);
}

/**
 * Write the given lines in the given container.
 *
 * @param {D3} container - A <text> element to write in.
 * @param {string[]} lines - Each line will be written below the
 *   previous line.
 * @param {object} [options] - Possible options include:
 *   - {number} maxWidth - The maximum width for text to wrap at.
 *   - {number} maxHeight - The maximum height for text to go to,
 *     at which point, the text will scale in size to fit.
 *   - {number} [padding=0] - Padding within maxWidth and maxHeight
 */
export function writeLines(container, lines, options={}) {
    options = _.defaults({}, options, {
        padding: 0,
    });

    let lineNumber = -1;
    function newline() {
        lineNumber++;
        // how far each line is from the previous line
        let dy = lineNumber === 0 ? 0 : 1.2;
        return container.append("tspan")
            .attr("x", container.attr("x"))
            .attr("dy", `${dy}em`);
    }

    // split up lines containing "\n"
    lines = _.flatMap(lines, line => line.split("\n"));

    if (_.isUndefined(options.maxWidth)) {
        lines.forEach(line => {
            newline().text(line);
        });
    } else {
        let maxWidth = options.maxWidth - 2 * options.padding;
        // split line into words
        lines = lines.map(line => line.split(" "));
        lines.forEach(words => {
            let buffer = [];
            let line = newline();
            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                buffer.push(word);
                line.text(buffer.join(" "));
                if (line.node().getComputedTextLength() > maxWidth) {
                    buffer.pop();
                    line.text(buffer.join(" "));
                    line = newline();
                    buffer = [];
                    i--;
                }
            }
        });
    }

    if (options.maxHeight) {
        let maxHeight = options.maxHeight - 2 * options.padding;
        let textHeight = $.fromD3(container).getDimensions().height;
        let factor = maxHeight / textHeight;
        if (factor < 1) {
            container.attr("transform", `scale(${factor})`);
        }
    }
}
