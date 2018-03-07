/**
 * @file A collection of utility functions related to generating viewpsheets
 */

import { align } from "utils/SVGUtils";

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

// font size of viewpsheet title
export const TITLE_LABEL_SIZE = 24;
// font size of sheet label
export const SHEET_LABEL_SIZE = 24;
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

// information for the birds eye graphs
export const birdsEyePerColumn = 6;
export const birdsEyeGraphs = {
    width: QUADRANT_WIDTH,
    height: (PAGE_HEIGHT - 2 * PAGE_MARGIN - TITLE_LABEL_SIZE) / birdsEyePerColumn,
};
export const birdsEyeWidget = {
    x: SHEET_LABEL_SIZE,
    y: WIDGET_MARGIN,
    width: birdsEyeGraphs.width - SHEET_LABEL_SIZE,
    height: birdsEyeGraphs.height - 2 * WIDGET_MARGIN - EAST_LABEL_SIZE,
};

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
    y: widgetHeights[0] + widgetHeights[1] + WIDGET_MARGIN,
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
    y: widgetHeights[0] + widgetHeights[1] + widgetHeights[2] + WIDGET_MARGIN,
    width: QUADRANT_WIDTH,
    height: widgetHeights[3] - WIDGET_MARGIN - EAST_LABEL_SIZE - 2,
};

// information for the summary sheet
export const summarySheets = {
    minHeight: (PAGE_HEIGHT - 2 * PAGE_MARGIN) / 10,
};
let summaryLabelSize = SHEET_LABEL_SIZE + 10;
let summaryWidth = QUADRANT_WIDTH - summaryLabelSize;
export const summaryContinuities = {
    x: summaryLabelSize,
    y: WIDGET_MARGIN,
    width: summaryWidth * 2/3 - WIDGET_MARGIN,
    height: summarySheets.minHeight - 2 * WIDGET_MARGIN,
};
export const summaryMovement = {
    x: summaryContinuities.x + summaryContinuities.width + 2 * WIDGET_MARGIN,
    y: summaryContinuities.y,
    width: summaryWidth / 3 - WIDGET_MARGIN,
    height: summarySheets.minHeight - 2 * WIDGET_MARGIN - EAST_LABEL_SIZE - 2,
};

export const ORIENTATIONS = {
    default: "Same as stuntsheet",
    east: "Always East Up",
    west: "Always West Up",
};

/**
 * Add the east label to the given container, as an indicator of the
 * east sideline in an adjacent graph.
 *
 * @param {D3} container
 * @param {object} widget - Information about a widget.
 * @param {boolean} isEast - true if east is up for widget.
 * @return {number} The offset from the top of the container to draw
 *   the graph.
 */
export function addEastLabel(container, widget, isEast) {
    let eastLabel = container.append("text")
        .classed("east-label", true)
        .text("Cal side")
        .attr("x", widget.width / 2)
        .attr("font-size", EAST_LABEL_SIZE)
        .attr("textLength", 75);

    if (isEast) {
        eastLabel.attr("y", 0);
        align(eastLabel, "top", "center");
        return $.fromD3(eastLabel).getDimensions().height;
    } else {
        eastLabel.attr("y", widget.height + EAST_LABEL_SIZE + 5);
        align(eastLabel, "bottom", "center");
        return 0;
    }
}

if (_.isUndefined(jsPDF)) {
    console.error("jsPDF is not loaded!");
    if (_.isUndefined(svgAsPngUri)) {
        console.error("svgAsPngUri is not loaded!");
    }
}

/**
 * Download the given viewpsheet as a PDF.
 *
 * @param {jQuery} pages - The collection of svg.page elements
 * @param {function} callback
 */
export function generatePDF(pages, callback) {
    let doc = new jsPDF({
        unit: "in",
        format: "letter",
    });
    let images = {};
    _.each(pages, (page, i) => {
        svgAsPngUri(page, {}, uri => {
            images[i] = uri;
            if (_.size(images) === pages.length) {
                _.range(pages.length).forEach(i => {
                    if (i > 0) {
                        doc.addPage();
                    }
                    doc.addImage(images[i], "png", 0, 0, 8.5, 11);
                });
                callback(doc);
            }
        });
    });
}
