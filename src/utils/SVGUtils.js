/**
 * @file A collection of utility functions related to SVG generation.
 */

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
 * @param {object} options - Possible options include:
 *   - {boolean} [drawCenter=true] - If false, shift the dot
 *     so that the top-left corner of the dot is in the top-left
 *     corner of the container. If true, keep the center of the dot
 *     in the top-left corner of the container.
 */
export function drawDot(container, dotRadius, dotType, options={}) {
    options = _.defaults({}, options, {
        drawCenter: true,
    });

    let offset = options.drawCenter ? 0 : dotRadius;

    let dot = container.append("circle")
        .attr("cx", offset)
        .attr("cy", offset)
        .attr("r", dotRadius);
    if (dotType.match(/plain/)) {
        dot.attr("fill", "none");
        dot.attr("stroke", "black");
    }
    if (dotType.match(/forwardslash|x/)) {
        container.append("line")
            .attr("stroke", "black")
            .attr("x1", offset - dotRadius)
            .attr("y1", offset + dotRadius)
            .attr("x2", offset + dotRadius)
            .attr("y2", offset - dotRadius);
    }
    if (dotType.match(/backslash|x/)) {
        container.append("line")
            .attr("stroke", "black")
            .attr("x1", offset - dotRadius)
            .attr("y1", offset - dotRadius)
            .attr("x2", offset + dotRadius)
            .attr("y2", offset + dotRadius);
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
