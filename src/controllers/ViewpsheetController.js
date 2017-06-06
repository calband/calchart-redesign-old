import ApplicationController from "controllers/ApplicationController";
import ViewpsheetSettingsPopup from "popups/ViewpsheetSettingsPopup";

import HTMLBuilder from "utils/HTMLBuilder";
import {
    align,
    LEFT_RIGHT_QUADRANTS,
    PAGE_HEIGHT,
    PAGE_WIDTH,
    QUADRANT_WIDTH,
    TOP_BOTTOM_QUARDRANTS,
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
                    page = this._setupPage();
                }
                let position = quadrants[quadrant];

                this._generateSheet(page, sheet, dot)
                    .attr("transform", `translate(${position.x}, ${position.y})`);
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

    }

    /**
     * Add the summary sheet to the viewpsheet for the given dot.
     *
     * @param {Dot} dot
     */
    _addSummary(dot) {

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
        let $sheet = page.append("g");

        let label = $sheet.append("text")
            .text(`SS ${sheet.getLabel()}`)
            .attr("x", QUADRANT_WIDTH)
            .attr("y", 0)
            .attr("font-size", 36);
        align(label, "top", "right");

        // generate dot type continuities
        // generate dot continuities
        // generate movement diagram
        // generate nearby diagram

        return $sheet;
    }

    /**
     * Setup a page for drawing sheets on.
     *
     * @return {D3}
     */
    _setupPage() {
        let page = d3.select(this.viewpsheet[0])
            .append("svg")
            .classed("page", true)
            .attr("width", PAGE_WIDTH)
            .attr("height", PAGE_HEIGHT);

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

        return page;
    }
}
