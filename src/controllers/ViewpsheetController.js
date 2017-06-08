import SaveViewpSettingsAction from "actions/SaveViewpSettingsAction";
import ApplicationController from "controllers/ApplicationController";
import ViewpsheetGrapher from "graphers/ViewpsheetGrapher";
import ViewpsheetSettingsPopup from "popups/ViewpsheetSettingsPopup";

import HTMLBuilder from "utils/HTMLBuilder";
import { update } from "utils/JSUtils";
import {
    align,
    drawDot,
    LABEL_SIZE,
    LEFT_RIGHT_QUADRANTS,
    PAGE_HEIGHT,
    PAGE_WIDTH,
    QUADRANT_HEIGHT,
    QUADRANT_ROWS,
    QUADRANT_WIDTH,
    TOP_BOTTOM_QUADRANTS,
    WIDGET_MARGIN,
    WIDGET_HEIGHTS,
    writeLines,
} from "utils/ViewpsheetUtils";

/**
 * The controller that stores the state of the viewpsheet application and contains
 * all of the actions that can be run in the viewpsheet page.
 *
 * Settings are saved to server in the User model.
 */
export default class ViewpsheetController extends ApplicationController {
    /**
     * @param {Show} show - The show being viewed in the application.
     * @param {int[]} dots - Dot IDs to generate viewpsheets for.
     * @param {object} settings - User settings for generating viewpsheets.
     */
    constructor(show, dots, settings) {
        super(show);

        this._dots = dots.map(id => show.getDot(id));
        this._settings = _.defaults(settings, {
            // see CalchartUtils.ORIENTATION_OPTIONS
            pathOrientation: "default",
            nearbyOrientation: "default",
            birdsEyeOrientation: "default",
            // {boolean} if true, stuntsheets go left/right; else top/bottom
            layoutLeftRight: true,
        });
    }

    get viewpsheet() {
        return $(".content .viewpsheet");
    }

    init() {
        super.init();

        this.viewpsheet.containScroll();

        $(".buttons .open-settings").click(e => {
            new ViewpsheetSettingsPopup(this).show();
        });

        $(".buttons .download").click(e => {
            // TODO
        });
    }

    /**** METHODS ****/

    /**
     * Generate the viewpsheets. Each page in the viewpsheet is an SVG. When
     * viewed on the page, the SVG is interactive. The SVGs can also be converted
     * to PDFs to be downloaded.
     */
    generate() {
        this.viewpsheet.empty();

        if (this._dots.length === 0) {
            HTMLBuilder.make("p.no-dots-message", "No dots selected")
                .appendTo(this.viewpsheet);
            return;
        }

        this._dots.forEach(dot => {
            this._addBirdsEye(dot);

            let quadrants = this._settings.layoutLeftRight
                ? LEFT_RIGHT_QUADRANTS
                : TOP_BOTTOM_QUADRANTS;

            let page;
            this.show.getSheets().forEach((sheet, i) => {
                let quadrant = i % 4;

                if (quadrant === 0) {
                    page = this._addPage();
                    page.append("line")
                        .classed("page-divider", true)
                        .attr("x1", PAGE_WIDTH / 2)
                        .attr("y1", 0)
                        .attr("x2", PAGE_WIDTH / 2)
                        .attr("y2", PAGE_HEIGHT);
                    page.append("line")
                        .classed("page-divider", true)
                        .attr("x1", 0)
                        .attr("y1", PAGE_HEIGHT / 2)
                        .attr("x2", PAGE_WIDTH)
                        .attr("y2", PAGE_HEIGHT / 2);
                }

                let $sheet = this._generateSheet(page, sheet, dot);
                let position = quadrants[quadrant];
                $sheet.attr("transform", `translate(${position.x}, ${position.y})`);
            });

            this._addSummary(dot);
        });
    }

    /**
     * @return {Dot[]}
     */
    getDots() {
        return this._dots;
    }

    /**
     * @return {object}
     */
    getSettings() {
        return this._settings;
    }

    /**
     * Save settings from the popup and save them on the server.
     *
     * @param {object} settings
     */
    saveSettings(settings) {
        let ids = settings.dots;
        this._dots = ids.map(id => this.show.getDot(id));
        delete settings.dots;

        update(this._settings, settings);
        window.history.replaceState(null, "", `?dots=${ids.join(",")}`);

        // save to server
        new SaveViewpSettingsAction().send(this._settings);

        this.generate();
    }

    /**** HELPERS ****/

    /**
     * Add the birds eye graphs to the viewpsheet for the given dot.
     *
     * @param {Dot} dot
     */
    _addBirdsEye(dot) {
        // let page = this._addPage()
    }

    /**
     * Setup a page for drawing sheets on.
     *
     * @return {D3}
     */
    _addPage() {
        return d3.select(this.viewpsheet[0])
            .append("svg")
            .classed("page", true)
            .attr("width", PAGE_WIDTH)
            .attr("height", PAGE_HEIGHT);
    }

    /**
     * Add the summary sheet to the viewpsheet for the given dot.
     *
     * @param {Dot} dot
     */
    _addSummary(dot) {
        // let page = this._addPage()
    }

    /**
     * Draw the dot continuities text box
     *
     * @param {D3} quadrant
     * @param {Sheet} sheet
     * @param {Dot} dot
     */
    _drawDotContinuities(quadrant, sheet, dot) {
        let y = QUADRANT_ROWS[1] + WIDGET_MARGIN;
        let dotContinuities = quadrant.append("g")
            .attr("transform", `translate(0, ${y})`);

        let boxWidth = QUADRANT_WIDTH;
        let boxHeight = WIDGET_HEIGHTS[1] - 2 * WIDGET_MARGIN;
        dotContinuities.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", boxWidth)
            .attr("height", boxHeight);

        let dotType = sheet.getDotType(dot);
        let fontSize = 13;

        let dotRadius = fontSize * 0.4;
        let $dot = dotContinuities.append("g")
            .attr("transform", `translate(${WIDGET_MARGIN}, ${WIDGET_MARGIN})`);
        drawDot($dot, dotRadius, dotType);

        let colonPosition = dotRadius * 2 + 3;
        let colon = $dot.append("text")
            .text(":")
            .attr("x", colonPosition)
            .attr("y", colonPosition - 2)
            .attr("font-size", fontSize);
        align(colon, "bottom", "left");

        let continuities = sheet.getContinuities(dotType).map(continuity => continuity.getText());
        let text = dotContinuities.append("text")
            .attr("x", WIDGET_MARGIN + colonPosition + 7)
            .attr("y", WIDGET_MARGIN)
            .attr("font-size", fontSize);
        align(text, "top", "left");
        writeLines(text, continuities, {
            padding: WIDGET_MARGIN,
            maxWidth: boxWidth,
            maxHeight: boxHeight,
        });
    }

    /**
     * Draw the individual continuities text box
     *
     * @param {D3} quadrant
     * @param {Sheet} sheet
     * @param {Dot} dot
     */
    _drawIndividualContinuities(quadrant, sheet, dot) {
        let y = QUADRANT_ROWS[2] + WIDGET_MARGIN;
        let individualContinuities = quadrant.append("g")
            .attr("transform", `translate(0, ${y})`);

        let boxWidth = QUADRANT_WIDTH / 2 - WIDGET_MARGIN;
        let boxHeight = WIDGET_HEIGHTS[2] - 2 * WIDGET_MARGIN;
        let fontSize = 14;

        individualContinuities.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", boxWidth)
            .attr("height", boxHeight);

        let movements = sheet.getDotInfo(dot).movements.map(movement => movement.getText());
        let text = individualContinuities.append("text")
            .attr("x", WIDGET_MARGIN)
            .attr("y", WIDGET_MARGIN)
            .attr("font-size", fontSize);
        align(text, "top", "left");
        writeLines(text, movements, {
            padding: WIDGET_MARGIN,
            maxWidth: boxWidth,
            maxHeight: boxHeight - fontSize,
        });

        let duration = sheet.getDuration();
        let totalBeats = individualContinuities.append("text")
            .text(`${duration} beats total`)
            .attr("x", boxWidth / 2)
            .attr("y", boxHeight)
            .attr("font-size", fontSize);
        align(totalBeats, "bottom", "center");
    }

    /**
     * Draw the movement diagram widget
     *
     * @param {D3} quadrant
     * @param {Sheet} sheet
     * @param {Dot} dot
     */
    _drawMovementDiagram(quadrant, sheet, dot) {
        let x = QUADRANT_WIDTH / 2 + WIDGET_MARGIN;
        let y = QUADRANT_ROWS[2] + WIDGET_MARGIN;
        let movementDiagram = quadrant.append("g")
            .attr("transform", `translate(${x}, ${y})`);

        let eastLabel = movementDiagram.append("text")
            .classed("east-label", true)
            .text("Cal side")
            .attr("y", 0)
            .attr("textLength", 75);
        align(eastLabel, "top", "center");

        let graphY = $.fromD3(eastLabel).getDimensions().height;
        let graphWidth = QUADRANT_WIDTH / 2 - WIDGET_MARGIN;
        let graphHeight = WIDGET_HEIGHTS[2] - 2 * WIDGET_MARGIN - graphY;

        eastLabel.attr("x", graphWidth / 2);

        let graph = movementDiagram.append("g")
            .attr("transform", `translate(0, ${graphY})`);
        new ViewpsheetGrapher(graph, graphWidth, graphHeight, sheet, dot).drawPath();
    }

    /**
     * Draw the nearby dots widget
     *
     * @param {D3} quadrant
     * @param {Sheet} sheet
     * @param {Dot} dot
     */
    _drawNearbyDiagram(quadrant, sheet, dot) {
        let nearbyDiagram = quadrant.append("rect")
            .attr("x", 0)
            .attr("y", QUADRANT_ROWS[3] + WIDGET_MARGIN)
            .attr("width", QUADRANT_WIDTH)
            .attr("height", WIDGET_HEIGHTS[3] - WIDGET_MARGIN);
    }

    /**
     * Add the <g> element containing viewpsheet information for the
     * given sheet to the given page.
     *
     * @param {D3} page
     * @param {Sheet} sheet
     * @param {Dot} dot
     * @return {D3}
     */
    _generateSheet(page, sheet, dot) {
        let quadrant = page.append("g");

        // sheet label
        let label = quadrant.append("text")
            .text(`SS ${sheet.getLabel()}`)
            .attr("x", QUADRANT_WIDTH)
            .attr("y", QUADRANT_ROWS[0])
            .attr("font-size", LABEL_SIZE);
        align(label, "top", "right");

        this._drawDotContinuities(quadrant, sheet, dot);
        this._drawIndividualContinuities(quadrant, sheet, dot);
        this._drawMovementDiagram(quadrant, sheet, dot);
        this._drawNearbyDiagram(quadrant, sheet, dot);

        return quadrant;
    }
}
