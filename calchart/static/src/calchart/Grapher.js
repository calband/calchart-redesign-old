import * as d3 from "d3";
import * as _ from "lodash";

import Coordinate from "calchart/Coordinate";
import CollegeGrapher from "calchart/graphers/CollegeGrapher";

import { getNearestOrientation } from "utils/CalchartUtils";

/**
 * A Grapher is responsible for drawing the field and the dots according to
 * the current state of the show.
 */
export default class Grapher {
    /**
     * @param {Show} show - The show that will be graphed
     * @param {jQuery} drawTarget - The HTML element the Grapher will draw to.
     * @param {Object} [options] - Options to set. @see Grapher#setOption.
     */
    constructor(show, drawTarget, options={}) {
        this._show = show;
        this._drawTarget = drawTarget;
        this._options = options;

        // the GrapherScale containing data about scale
        this._scale = null;

        // the radius of the dots to draw; proportional to scale
        this._dotRadius = undefined;

        // maps dot label to dot SVG element
        this._dots = {};

        let svgWidth = this._drawTarget.width();
        let svgHeight = this._drawTarget.height();

        this._svg = d3.select(this._drawTarget.get(0))
            .append("svg")
            .attr("class", "graph")
            .attr("width", svgWidth)
            .attr("height", svgHeight);
    }

    get svgWidth() { return this._svgWidth; }
    get svgHeight() { return this._svgHeight; }

    /**
     * Clear the Grapher of all graphics.
     */
    clear() {
        this._svg.empty();
    }

    /**
     * Clear the Grapher of all the dots (i.e. keeping the field).
     */
    clearDots() {
        this._svg.find(".dots").remove();
    }

    /**
     * Deselect the given dots. Use to deselect dots without having to refresh the
     * entire graph.
     *
     * @param {jQuery} dots
     */
    deselectDots(dots) {
        d3.selectAll(dots).classed("selected", false);
    }

    /**
     * Draw a moment in a field show. The moment is given as a beat of a
     * particular stuntsheet.
     *
     * @param {Sheet} sheet - The stuntsheet to draw.
     * @param {int} [currentBeat=0] - The beat to draw, relative to the start
     *   of the Sheet.
     * @param {jQuery} [selectedDots] - The selected dots, defaults to none.
     */
    draw(sheet, currentBeat=0, selectedDots=null) {
        let fieldType = sheet.getFieldType();
        let field = this._svg.select(".field");

        // re-draw field if no field is drawn or if the drawn field is of the wrong type
        if (field.empty() || !field.classed(`field-${fieldType}`)) {
            field.remove();
            this.drawField(fieldType);
        }

        this._drawDots(sheet, currentBeat);
        this.selectDots(selectedDots);
    }

    /**
     * Draw the field using the appropriate FieldGrapher
     *
     * @param {string} [fieldType] - The field type to draw. Defaults to using the
     *   default field type of the Show.
     */
    drawField(fieldType) {
        if (_.isUndefined(fieldType)) {
            fieldType = this._show.getFieldType();
        }

        this._svg.insert("g", ":first-child").classed(`field field-${fieldType}`, true);

        let fieldGrapher;
        switch (fieldType) {
            case "college":
                fieldGrapher = new CollegeGrapher(this._svg, this._options);
                break;
            default:
                throw new Error(`No Grapher of type: ${fieldType}`);
        }

        fieldGrapher.drawField();
        this._scale = fieldGrapher.getScale();
        this._dotRadius = this._scale.toDistance(3/4);
    }

    /**
     * @return {jQuery} The dots in the grapher.
     */
    getDots() {
        return $(this._svg.selectAll("g.dot").nodes());

    }

    /**
     * @return {jQuery} The SVG graph element.
     */
    getGraph() {
        return $(this._svg.node());
    }

    /**
     * @return {GrapherScale} The scale of the Grapher field.
     */
    getScale() {
        return this._scale;
    }

    /**
     * @param {jQuery} dot - The dot to check.
     * @return {boolean} true if the given dot is selected.
     */
    isSelected(dot) {
        return d3.select(dot[0]).classed("selected");
    }

    /**
     * Move the given dot to the given coordinates.
     *
     * @param {jQuery} dot
     * @param {float} x - The x-coordinate of the dot's position, in pixels.
     * @param {float} y - The y-coordinate of the dot's position, in pixels.
     */
    moveDotTo(dot, x, y) {
        $(dot)
            .attr("transform", `translate(${x}, ${y})`)
            .data("position", new Coordinate(x, y));
    }

    /**
     * Select the given dots. Use to select dots without having to refresh the
     * entire graph.
     *
     * @param {?jQuery} dots
     */
    selectDots(dots) {
        d3.selectAll(dots).classed("selected", true);
    }

    /**
     * Set a Grapher option. The available options are:
     *  - {boolean} circleSelected - If true, circles the selected dot, or the last
     *    selected dot, if multiple (default false).
     *  - {boolean} draw4Step - If true, draws 4 step lines (default false).
     *  - {boolean} drawDotType - If true, draw dots according to their dot type, overriding
     *    drawOrientation. (default false).
     *  - {boolean} drawOrientation - If true, colors dots differently based on orientation.
     *  - {boolean} drawYardlineNumbers - If true, draws yardline numbers (default false).
     *  - {boolean} drawYardlines - If true, draw yardlines and hashes (default true).
     *  - {float} fieldPadding - The minimum amount of space between the field and the SVG
     *    (default 30).
     *  - {boolean} labelLeft - If true, show the label on the left of the dot (default true).
     *  - {boolean} showLabels - If true, show the label next to each dot (default false).
     */
    setOption(name, val) {
        this._options[name] = val;
    }

    /**
     * Draw the dots in the given Sheet at the given beat onto the SVG.
     *
     * @param {Sheet} sheet - The sheet to draw.
     * @param {int} currentBeat - Beat to draw, relative to the start of the Sheet.
     */
    _drawDots(sheet, currentBeat) {
        let _this = this;
        let options = this._options;
        let dotRadius = this._dotRadius;

        // group containing all dots
        let dotsGroup = this._svg.select("g.dots");
        if (dotsGroup.empty()) {
            dotsGroup = this._svg.append("g").classed("dots", true);
        }

        // order dots in reverse order so that lower dot values are drawn on top
        // of higher dot values
        let dots = this._show.getDots().sort(function(dot1, dot2) {
            return -1 * dot1.compareTo(dot2);
        });

        // each dot consists of a group containing all svg elements making up a dot
        let dotGroups = dotsGroup.selectAll("g.dot").data(dots);
        if (dotGroups.empty()) {
            dotGroups = dotGroups.enter()
                .append("g")
                .attr("id", function(dot) {
                    let label = dot.getLabel();
                    return `dot-${label}`;
                });
        }
        
        dotGroups.each(function(dot) {
            // special case in case dots are positioned without having movements
            let state;
            if (currentBeat === 0) {
                state = sheet.getPosition(dot);
            } else {
                try {
                    state = sheet.getAnimationState(dot, currentBeat);
                } catch (e) {
                    // ran out of movements
                    state = sheet.getFinalPosition(dot);
                }
            }

            // save dot in jQuery data also
            $(this).data("dot", dot);

            let dotClass;
            if (options.drawDotType) {
                dotClass = sheet.getDotType(dot);
            } else if (options.drawOrientation !== false) {
                dotClass = getNearestOrientation(state.angle);
            }

            let dotGroup = d3.select(this).attr("class", `dot ${dotClass}`);

            let dotMarker = dotGroup.selectAll(".dot-marker");
            if (dotMarker.empty()) {
                // draw slashes first, to keep behind dot-marker
                if (options.drawDotType) {
                    let start = -1.1 * dotRadius;
                    let end = 1.1 * dotRadius;
                    dotGroup
                        .append("line")
                        .classed("fslash", true)
                        .attr("x1", start)
                        .attr("y1", end)
                        .attr("x2", end)
                        .attr("y2", start);
                    dotGroup
                        .append("line")
                        .classed("bslash", true)
                        .attr("x1", start)
                        .attr("y1", start)
                        .attr("x2", end)
                        .attr("y2", end);
                }

                dotMarker = dotGroup
                    .append("circle")
                    .attr("r", dotRadius)
                    .classed("dot-marker", true);
            }

            if (options.circleSelected) {
                let circle = dotGroup.selectAll("circle.selected-circle");
                if (circle.empty()) {
                    circle = dotGroup.append("circle")
                        .classed("selected-circle", true)
                        .attr("r", dotRadius * 2);
                }
            }

            if (options.showLabels) {
                let dotLabel = dotGroup.select(".dot-label");
                if (dotLabel.empty()) {
                    dotLabel = dotGroup.append("text")
                        .classed("dot-label", true)
                        .attr("font-size", dotRadius * 2.5)
                        .text(dot.getLabel());
                }

                let offsetX = -2.25 * dotRadius;
                let offsetY = -1.25 * dotRadius;
                if (options.labelLeft === false) {
                    offsetX *= -1;
                }

                dotLabel.attr("x", offsetX).attr("y", offsetY);
            }

            let x = _this._scale.xScale(state.x);
            let y = _this._scale.yScale(state.y);
            _this.moveDotTo(this, x, y);
        });
    }
}
