import Grapher from "calchart/Grapher";
import ApplicationController from "controllers/ApplicationController";
import ViewpsheetSettingsPopup from "popups/ViewpsheetSettingsPopup";

import HTMLBuilder from "utils/HTMLBuilder";

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
            // {boolean} if true, go left/right; else top/bottom
            layoutLeftRight: true,
            // {Dot[]}
            dots: [],
        };
    }

    init() {
        super.init();

        $(".buttons .open-settings").click(e => {
            new ViewpsheetSettingsPopup(this).show();
        });
    }

    /**** METHODS ****/

    /**
     * Generate the viewpsheets. Each page in the viewpsheet is an SVG. When
     * viewed on the page, the SVG is interactive. The SVGs can also be converted
     * to PDFs to be downloaded.
     */
    generate() {
        // TODO
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
}
