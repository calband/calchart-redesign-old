import ApplicationController from "controllers/ApplicationController";
import ViewpsheetSettingsPopup from "popups/ViewpsheetSettingsPopup";

import HTMLBuilder from "utils/HTMLBuilder";
import {
    align,
    LABEL_SIZE,
    LEFT_RIGHT_QUADRANTS,
    PAGE_HEIGHT,
    PAGE_WIDTH,
    QUADRANT_HEIGHT,
    QUADRANT_ROWS,
    QUADRANT_WIDTH,
    TOP_BOTTOM_QUARDRANTS,
    WIDGET_MARGIN,
    WIDGET_HEIGHTS,
} from "utils/ViewpsheetUtils";

/**
 * The controller that stores the state of the viewpsheet application and contains
 * all of the actions that can be run in the viewpsheet page.
 */
export default class ViewpsheetController extends ApplicationController {
    /**
     * @param {Show} show - The show being viewed in the application.
     */
    constructor(show) {
        super(show);

        this._settings = {
            // see CalchartUtils.ORIENTATION_OPTIONS
            pathOrientation: "default",
            nearbyOrientation: "default",
            birdsEyeOrientation: "default",
            // {boolean} if true, stuntsheets go left/right; else top/bottom
            layoutLeftRight: true,
            // {Dot[]}
            dots: [],
        };
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
        this.viewpsheet.find("p.no-dots-message").remove();
        if (this._settings.dots.length === 0) {
            HTMLBuilder.make("p.no-dots-message", "No dots selected")
                .appendTo(this.viewpsheet);
            return;
        }

        this._settings.dots.forEach(dot => {
            this._addBirdsEye(dot);

            let quadrants = this._settings.layoutLeftRight
                ? LEFT_RIGHT_QUADRANTS
                : TOP_BOTTOM_QUARDRANTS;

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
     * @return {object}
     */
    getSettings() {
        return this._settings;
    }

    /**
     * Set the dots generating viewpsheets for, and re-generate the viewpsheet.
     *
     * @param {Dot[]} dots
     */
    setDots(dots) {
        this._settings.dots = dots;
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
     * Add the dot continuities text box
     *
     * @param {D3} quadrant
     * @param {Sheet} sheet
     * @param {Dot} dot
     */
    _addDotContinuities(quadrant, sheet, dot) {
        let dotContinuities = quadrant.append("rect")
            .attr("x", 0)
            .attr("y", QUADRANT_ROWS[1] + WIDGET_MARGIN)
            .attr("width", QUADRANT_WIDTH)
            .attr("height", WIDGET_HEIGHTS[1] - 2 * WIDGET_MARGIN);
    }

    /**
     * Add the individual continuities text box
     *
     * @param {D3} quadrant
     * @param {Sheet} sheet
     * @param {Dot} dot
     */
    _addIndividualContinuities(quadrant, sheet, dot) {
        let individualContinuities = quadrant.append("rect")
            .attr("x", 0)
            .attr("y", QUADRANT_ROWS[2] + WIDGET_MARGIN)
            .attr("width", QUADRANT_WIDTH / 2 - WIDGET_MARGIN)
            .attr("height", WIDGET_HEIGHTS[2] - 2 * WIDGET_MARGIN);
    }

    /**
     * Add the movement diagram widget
     *
     * @param {D3} quadrant
     * @param {Sheet} sheet
     * @param {Dot} dot
     */
    _addMovementDiagram(quadrant, sheet, dot) {
        let movementDiagram = quadrant.append("rect")
            .attr("x", QUADRANT_WIDTH / 2 + WIDGET_MARGIN)
            .attr("y", QUADRANT_ROWS[2] + WIDGET_MARGIN)
            .attr("width", QUADRANT_WIDTH / 2 - WIDGET_MARGIN)
            .attr("height", WIDGET_HEIGHTS[2] - 2 * WIDGET_MARGIN);
    }

    /**
     * Add the nearby dots widget
     *
     * @param {D3} quadrant
     * @param {Sheet} sheet
     * @param {Dot} dot
     */
    _addNearbyDiagram(quadrant, sheet, dot) {
        let nearbyDiagram = quadrant.append("rect")
            .attr("x", 0)
            .attr("y", QUADRANT_ROWS[3] + WIDGET_MARGIN)
            .attr("width", QUADRANT_WIDTH)
            .attr("height", WIDGET_HEIGHTS[3] - WIDGET_MARGIN);
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

        this._addDotContinuities(quadrant, sheet, dot);
        this._addIndividualContinuities(quadrant, sheet, dot);
        this._addMovementDiagram(quadrant, sheet, dot);
        this._addNearbyDiagram(quadrant, sheet, dot);

        return quadrant;
    }
}
