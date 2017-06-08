import SaveViewpSettingsAction from "actions/SaveViewpSettingsAction";
import ApplicationController from "controllers/ApplicationController";
import ViewpsheetGrapher from "graphers/ViewpsheetGrapher";
import ViewpsheetSettingsPopup from "popups/ViewpsheetSettingsPopup";

import HTMLBuilder from "utils/HTMLBuilder";
import { update } from "utils/JSUtils";
import {
    align,
    drawDot,
    move,
    writeLines,
} from "utils/SVGUtils";
import {
    addEastLabel,
    dotTypeWidget,
    EAST_LABEL_SIZE,
    individualWidget,
    LEFT_RIGHT_QUADRANTS,
    movementWidget,
    nearbyWidget,
    PAGE_HEIGHT,
    PAGE_WIDTH,
    QUADRANT_HEIGHT,
    QUADRANT_WIDTH,
    SHEET_LABEL_SIZE,
    TOP_BOTTOM_QUADRANTS,
    WIDGET_MARGIN,
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
            if (dot === undefined) {
                console.error(`Dot does not exist: ${dot}`);
                return;
            }

            this._addBirdsEye(dot);

            let quadrants = this._settings.layoutLeftRight
                ? LEFT_RIGHT_QUADRANTS
                : TOP_BOTTOM_QUADRANTS;

            let page;
            this.show.getSheets().forEach((sheet, i) => {
                let quadrant = i % 4;

                if (quadrant === 0) {
                    page = this._addPage();

                    // page dividers
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

                    // clip-path definitions for diagrams
                    // (http://tutorials.jenkov.com/svg/clip-path.html)
                    page.append("defs")
                        .append("clipPath").attr("id", "clip-movement")
                        .append("rect")
                            .attr("width", movementWidget.width)
                            .attr("height", movementWidget.height);
                    page.append("defs")
                        .append("clipPath").attr("id", "clip-nearby")
                        .append("rect")
                            .attr("width", nearbyWidget.width)
                            .attr("height", nearbyWidget.height);
                }

                let $sheet = this._generateSheet(page, sheet, dot);
                let position = quadrants[quadrant];
                move($sheet, position);
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
        // TODO
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
        // TODO
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
        let dotContinuities = quadrant.append("g");
        move(dotContinuities, dotTypeWidget);

        dotContinuities.append("rect")
            .attr("width", dotTypeWidget.width)
            .attr("height", dotTypeWidget.height);

        let dotType = sheet.getDotType(dot);
        let fontSize = 13;

        let dotRadius = fontSize * 0.4;
        let $dot = dotContinuities.append("g");
        move($dot, WIDGET_MARGIN, WIDGET_MARGIN);
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
            maxWidth: dotTypeWidget.width,
            maxHeight: dotTypeWidget.height,
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
        let individualContinuities = quadrant.append("g");
        move(individualContinuities, individualWidget);

        let fontSize = 14;

        individualContinuities.append("rect")
            .attr("width", individualWidget.width)
            .attr("height", individualWidget.height);

        let movements = sheet.getDotInfo(dot).movements.map(movement => movement.getText());
        let text = individualContinuities.append("text")
            .attr("x", WIDGET_MARGIN)
            .attr("y", WIDGET_MARGIN)
            .attr("font-size", fontSize);
        align(text, "top", "left");
        writeLines(text, movements, {
            padding: WIDGET_MARGIN,
            maxWidth: individualWidget.width,
            maxHeight: individualWidget.height - fontSize,
        });

        let duration = sheet.getDuration();
        let totalBeats = individualContinuities.append("text")
            .text(`${duration} beats total`)
            .attr("x", individualWidget.width / 2)
            .attr("y", individualWidget.height)
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
        let movementDiagram = quadrant.append("g");
        move(movementDiagram, movementWidget);

        let isEast = this._isEast(this._settings.pathOrientation, sheet);
        let graphY = addEastLabel(movementDiagram, movementWidget, isEast);

        let graph = movementDiagram.append("g")
            .attr("width", movementWidget.width)
            .attr("height", movementWidget.height)
            .style("clip-path", "url(#clip-movement)");
        move(graph, 0, graphY);
        new ViewpsheetGrapher(graph, sheet, dot, isEast).drawPath();

        // TODO: make interactive
    }

    /**
     * Draw the nearby dots widget
     *
     * @param {D3} quadrant
     * @param {Sheet} sheet
     * @param {Dot} dot
     */
    _drawNearbyDiagram(quadrant, sheet, dot) {
        let nearbyDiagram = quadrant.append("g");
        move(nearbyDiagram, nearbyWidget);

        let isEast = this._isEast(this._settings.nearbyOrientation, sheet);
        let graphY = addEastLabel(nearbyDiagram, nearbyWidget, isEast);

        let graph = nearbyDiagram.append("g")
            .attr("width", nearbyWidget.width)
            .attr("height", nearbyWidget.height)
            .style("clip-path", "url(#clip-nearby)");
        move(graph, 0, graphY);
        // new ViewpsheetGrapher(graph, sheet, dot, isEast).drawPath();

        // TODO: draw
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
            .attr("y", 0)
            .attr("font-size", SHEET_LABEL_SIZE);
        align(label, "top", "right");

        this._drawDotContinuities(quadrant, sheet, dot);
        this._drawIndividualContinuities(quadrant, sheet, dot);
        this._drawMovementDiagram(quadrant, sheet, dot);
        this._drawNearbyDiagram(quadrant, sheet, dot);

        return quadrant;
    }

    /**
     * Check if the given option is set to "east", or if "default", if the
     * given Sheet resolves to east.
     *
     * @param {string} option
     * @param {Sheet} sheet
     * @return {boolean}
     */
    _isEast(option, sheet) {
        switch (option) {
            case "east":
                return true;
            case "west":
                return false;
            case "default":
                return sheet.getOrientationDegrees() === 0;
        }
    }
}
