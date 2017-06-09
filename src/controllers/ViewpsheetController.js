import SaveViewpSettingsAction from "actions/SaveViewpSettingsAction";
import ApplicationController from "controllers/ApplicationController";
import ViewpsheetGrapher from "graphers/ViewpsheetGrapher";
import ViewpsheetSettingsPopup from "popups/ViewpsheetSettingsPopup";

import HTMLBuilder from "utils/HTMLBuilder";
import { runAsync, update } from "utils/JSUtils";
import {
    align,
    drawDot,
    move,
    writeLines,
} from "utils/SVGUtils";
import {
    addEastLabel,
    birdsEyePerColumn,
    birdsEyeGraphs,
    birdsEyeWidget,
    dotTypeWidget,
    EAST_LABEL_SIZE,
    generatePDF,
    individualWidget,
    LEFT_RIGHT_QUADRANTS,
    movementWidget,
    nearbyWidget,
    PAGE_HEIGHT,
    PAGE_MARGIN,
    PAGE_WIDTH,
    QUADRANT_HEIGHT,
    QUADRANT_WIDTH,
    SHEET_LABEL_SIZE,
    summaryContinuities,
    summaryMovement,
    summarySheets,
    TITLE_LABEL_SIZE,
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

        // TODO: only one dot for now
        this._dots = dots.map(id => show.getDot(id));
        this._settings = _.defaults(settings, {
            // see CalchartUtils.ORIENTATION_OPTIONS
            pathOrientation: "west",
            nearbyOrientation: "west",
            birdsEyeOrientation: "west",
            // {boolean} if true, stuntsheets go left/right; else top/bottom
            layoutLeftRight: true,
        });

        // {jsPDF}
        this._pdf = null;
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
            if (!$(e.currentTarget).hasClass("disabled")) {
                this._pdf.save(`${this.show.name}.pdf`);
            }
        });
    }

    /**** METHODS ****/

    /**
     * Generate the viewpsheets. Each page in the viewpsheet is an SVG. When
     * viewed on the page, the SVG is interactive. The SVGs can also be converted
     * to PDFs to be downloaded.
     */
    generate() {
        $(".buttons .download").addClass("disabled");
        this._pdf = null;
        this.viewpsheet
            .scrollTop(0) // in case user has already scrolled down
            .empty();

        if (this._dots.length === 0) {
            HTMLBuilder.make("p.no-dots-message", "No dots selected")
                .appendTo(this.viewpsheet);
            return;
        }

        let loadingScreen = HTMLBuilder.div("loading-screen")
            .appendTo("body");
        HTMLBuilder.make("p", "Loading...")
            .appendTo(loadingScreen);
        this.viewpsheet.lockScroll();

        runAsync(() => {
            this._dots.forEach(dot => {
                this.generateDot(dot);
            });
            generatePDF(this.viewpsheet.children(), pdf => {
                this._pdf = pdf;
                $(".buttons .download").removeClass("disabled");
                loadingScreen.remove();
                this.viewpsheet.unlockScroll();
            });
        });
    }

    /**
     * Generate the PDF for a dot.
     *
     * @param {Dot} dot
     */
    generateDot(dot) {
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
                let defs = page.append("defs");
                defs.append("clipPath")
                    .attr("id", "clip-movement")
                    .append("rect")
                        .attr("width", movementWidget.width)
                        .attr("height", movementWidget.height);
                defs.append("clipPath")
                    .attr("id", "clip-nearby")
                    .append("rect")
                        .attr("width", nearbyWidget.width)
                        .attr("height", nearbyWidget.height);
            }

            let $sheet = this._generateSheet(page, sheet, dot);
            let position = quadrants[quadrant];
            move($sheet, position);
        });

        this._addSummary(dot);
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
        let columnXs = [0, PAGE_WIDTH/2];
        let page;
        this.show.getSheets().forEach((sheet, i) => {
            let pageI = i % (birdsEyePerColumn * 2);
            if (pageI === 0) {
                page = this._addPage();
                let title = page.append("text")
                    .text(`${this.show.name}: Dot ${dot.label}`)
                    .attr("font-size", TITLE_LABEL_SIZE);
                align(title, "top", "center");
                move(title, PAGE_WIDTH/2, PAGE_MARGIN);
            }

            let x = columnXs[Math.floor(pageI / birdsEyePerColumn)] + PAGE_MARGIN;
            let y = birdsEyeGraphs.height * (pageI % birdsEyePerColumn) + TITLE_LABEL_SIZE + PAGE_MARGIN;
            let $sheet = page.append("g");
            move($sheet, x, y);

            let label = $sheet.append("text")
                .text(sheet.getIndex() + 1)
                .attr("font-size", SHEET_LABEL_SIZE)
                .attr("y", birdsEyeGraphs.height/2);
            align(label, "center", "left");

            let birdsEye = $sheet.append("g");
            move(birdsEye, birdsEyeWidget);

            let isEast = this._isEast(this._settings.birdsEyeOrientation, sheet);
            let graphY = addEastLabel(birdsEye, birdsEyeWidget, isEast);

            let graph = birdsEye.append("g")
                .attr("width", birdsEyeWidget.width)
                .attr("height", birdsEyeWidget.height)
                .style("clip-path", "url(#clip-birds-eye)");
            move(graph, 0, graphY);
            new ViewpsheetGrapher(graph, sheet, dot, isEast).drawBirdsEye();
        });
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
     * Add the summary sheets to the viewpsheet for the given dot.
     *
     * @param {Dot} dot
     */
    _addSummary(dot) {
        let newPage = () => {
            let page = this._addPage();
            let defs = page.append("defs");
            defs.append("clipPath")
                .attr("id", "clip-summary")
                .append("rect")
                    .attr("width", summaryMovement.width)
                    .attr("height", summaryMovement.height);
            return page;
        };

        let page = newPage();
        let currX = 0;
        let currY = PAGE_MARGIN;
        let maxHeight = PAGE_HEIGHT - PAGE_MARGIN;
        let fontSize = 14;

        this.show.getSheets().forEach((sheet, i) => {
            let $sheet = page.append("g");

            let individualBox = _.clone(summaryContinuities);

            // write continuities first to get possibly extended height
            let movements = sheet.getDotInfo(dot).movements.map(movement => movement.getText());
            let text = $sheet.append("text")
                .attr("x", individualBox.x + WIDGET_MARGIN)
                .attr("y", individualBox.y + WIDGET_MARGIN)
                .attr("font-size", fontSize);
            align(text, "top", "left");
            writeLines(text, movements, {
                padding: WIDGET_MARGIN,
                maxWidth: individualBox.width,
            });

            let textHeight = $.fromD3(text).getDimensions().height;
            // possibly stretched height, taking into account continuities and total beats label
            let stretchedHeight = textHeight + 2 * WIDGET_MARGIN + fontSize + 2;
            let diffHeight = Math.max(stretchedHeight - individualBox.height, 0);
            individualBox.height = Math.max(individualBox.height, stretchedHeight);

            // total beats
            let duration = sheet.getDuration();
            let totalBeats = $sheet.append("text")
                .text(`${duration} beats total`)
                .attr("x", individualBox.x + individualBox.width / 2)
                .attr("y", individualBox.y + individualBox.height)
                .attr("font-size", fontSize);
            align(totalBeats, "bottom", "center");

            // sheet label
            let label = $sheet.append("text")
                .text(sheet.getIndex() + 1)
                .attr("font-size", SHEET_LABEL_SIZE)
                .attr("y", individualBox.y + individualBox.height/2);
            align(label, "center", "left");

            // continuities box
            $sheet.append("rect")
                .attr("x", individualBox.x)
                .attr("y", individualBox.y)
                .attr("width", individualBox.width)
                .attr("height", individualBox.height);

            // movement diagram
            let movementBox = _.extend({}, summaryMovement, {
                y: WIDGET_MARGIN + diffHeight / 2,
            });

            let movementDiagram = $sheet.append("g");
            move(movementDiagram, movementBox);

            let isEast = this._isEast(this._settings.pathOrientation, sheet);
            let graphY = addEastLabel(movementDiagram, movementBox, isEast);

            let graph = movementDiagram.append("g")
                .attr("width", movementBox.width)
                .attr("height", movementBox.height)
                .style("clip-path", "url(#clip-summary)");
            move(graph, 0, graphY);

            // field border
            graph.append("rect")
                .attr("width", movementBox.width)
                .attr("height", movementBox.height);

            new ViewpsheetGrapher(graph, sheet, dot, isEast).drawPath();

            // wrap to next column if needed
            let nextY = currY + individualBox.height + 2 * WIDGET_MARGIN;
            if (nextY > maxHeight) {
                if (currX === 0) {
                    currX = PAGE_WIDTH / 2;
                } else {
                    currX = 0;
                    page = newPage();
                    $sheet.remove();
                    page.append(() => $sheet.node());
                }
                currY = PAGE_MARGIN;
                nextY = currY + individualBox.height + 2 * WIDGET_MARGIN;
            }
            move($sheet, currX + PAGE_MARGIN, currY);
            currY = nextY;
        });
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
        drawDot($dot, dotRadius, dotType, {
            drawCenter: false,
        });

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

        // field border
        graph.append("rect")
            .attr("width", movementWidget.width)
            .attr("height", movementWidget.height);

        new ViewpsheetGrapher(graph, sheet, dot, isEast).drawPath();
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

        // field border
        graph.append("rect")
            .attr("width", nearbyWidget.width)
            .attr("height", nearbyWidget.height);

        new ViewpsheetGrapher(graph, sheet, dot, isEast).drawNearby();
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
