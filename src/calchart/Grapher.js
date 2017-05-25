import AnimationState from "calchart/AnimationState";
import Coordinate from "calchart/Coordinate";
import CollegeGrapher from "calchart/graphers/CollegeGrapher";
import Dot from "calchart/Dot";

import { getNearestOrientation } from "utils/CalchartUtils";
import { parseArgs } from "utils/JSUtils";

if (_.isUndefined(d3)) {
    console.error("D3 is not loaded!");
}

let FIELD_RATIO = 700 / 1250; // height = width * ratio
let BASE_WIDTH = 1250; // the width of the SVG at 100% zoom

/**
 * A Grapher is responsible for drawing the field and the dots according to
 * the current state of the show.
 */
export default class Grapher {
    /**
     * @param {Show} show - The show that will be graphed
     * @param {jQuery} drawTarget - The HTML element the Grapher will draw to.
     * @param {Object} [options] - Options to set. See Grapher.setOption for a
     *   a list of all the available options.
     */
    constructor(show, drawTarget, options={}) {
        this._show = show;
        this._drawTarget = drawTarget;

        this._options = _.defaults({}, options, {
            backgroundVisible: false,
            boundDots: false,
            dotFormat: "none",
            draw4Step: false,
            drawYardlineNumbers: false,
            drawYardlines: true,
            expandField: false,
            fieldPadding: 30,
            labelLeft: true,
            showCollisions: false,
            showLabels: false,
            zoom: null,
        });

        // true to trigger drawing zoom-dependent aspects of the grapher; to
        // avoid redundant calculations in _drawDots
        this._redrawZoom = true;

        // the GrapherScale containing data about scale
        this._scale = null;

        this._svg = d3.select(this._drawTarget.get(0))
            .append("svg")
            .attr("class", "graph");

        this._svgWidth = undefined;
        this._svgHeight = undefined;
    }

    get svgWidth() { return this._svgWidth; }
    get svgHeight() { return this._svgHeight; }

    /**
     * Clear the Grapher of all graphics.
     */
    clearField() {
        this._svg.select(".field").remove();
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
     */
    draw(sheet, currentBeat=0) {
        let fieldType = sheet.getFieldType();
        let field = this._svg.select("g.field");

        // re-draw field if needed
        if (field.empty() || !field.classed(`field-${fieldType}`) || this._redrawZoom) {
            field.remove();
            this.drawField(fieldType);
            field = this._svg.select("g.field");
        }

        let background = sheet.getBackground();
        let image = field.select("image.background-image");
        if (_.isUndefined(background)) {
            image.remove();
        } else {
            if (image.empty() || image.attr("href") !== background.url) {
                image.remove();
                // insert right after field background
                image = field.insert("image", ".field-background + *")
                    .classed("background-image", true)
                    .attr("preserveAspectRatio", "none");
            }

            let position = this._scale.toDistance(background);
            image.attr("href", background.url)
                .attr("width", this._scale.toDistance(background.width))
                .attr("height", this._scale.toDistance(background.height))
                .attr("x", position.x)
                .attr("y", position.y);
            this.showBackground();
        }

        this._drawDots(sheet, currentBeat);
    }

    /**
     * Draw the field using the appropriate FieldGrapher. Also set the scale of
     * the grapher based on the zoom level.
     *
     * @param {string} [fieldType] - The field type to draw. Defaults to using the
     *   default field type of the Show.
     */
    drawField(fieldType) {
        if (_.isUndefined(fieldType)) {
            fieldType = this._show.getFieldType();
        }

        let zoom = this._options.zoom;
        let svgWidth, svgHeight;
        if (_.isNull(zoom)) {
            svgWidth = this._drawTarget.width();
            svgHeight = this._drawTarget.height();
        } else {
            // bound zoom
            zoom = _.clamp(zoom, 0.4, 2);
            svgWidth = BASE_WIDTH * zoom;
            svgHeight = svgWidth * FIELD_RATIO;
            this._options.zoom = zoom;
        }

        this._svg.insert("g", ":first-child")
            .classed(`field field-${fieldType}`, true);

        let fieldGrapher = this._getFieldGrapher(fieldType, svgWidth, svgHeight);
        fieldGrapher.drawField();
        this._scale = fieldGrapher.getScale();
        this._svgWidth = fieldGrapher.svgWidth;
        this._svgHeight = fieldGrapher.svgHeight;
    }

    /**
     * Get the dot corresponding to the given Dot.
     *
     * @param {Dot|int} dot
     * @return {jQuery}
     */
    getDot(dot) {
        if (dot instanceof Dot) {
            dot = dot.id;
        }
        let dotNode = this._svg.select(`g.dot.dot-${dot}`);
        return $.fromD3(dotNode);
    }

    /**
     * Get the dots, optionally filtered by the given dots.
     *
     * @param {(Dot[]|int[])} [dots] - Dots or dot IDs to optionally filter by.
     * @return {jQuery} The dots in the grapher.
     */
    getDots(dots) {
        let dotGroups = this._svg.selectAll("g.dot");
        if (!_.isUndefined(dots)) {
            let ids = dots;
            if (dots.length > 0 && !_.isInteger(dots[0])) {
                ids = dots.map(dot => dot.id);
            }
            dotGroups = dotGroups.filter(dot => ids.includes(dot.id));
        }
        return $.fromD3(dotGroups);
    }

    /**
     * @return {number} The radius of the dots in the Grapher.
     */
    getDotRadius() {
        return this._scale.toDistance(3/4);
    }

    /**
     * @return {jQuery} The SVG graph element.
     */
    getGraph() {
        return $(this._svg.node());
    }

    /**
     * @param {string} name
     * @return {*} @see Grapher#setOption.
     */
    getOption(name) {
        return this._options[name];
    }

    /**
     * @return {GrapherScale} The scale of the Grapher field.
     */
    getScale() {
        // initialize scale if not initialized
        if (_.isNull(this._scale)) {
            this.drawField();
            this.clearField();
        }
        return this._scale;
    }

    /**
     * @return {D3} The SVG element wrapped in a D3 selection.
     */
    getSVG() {
        return this._svg;
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
        if (this._options.boundDots) {
            x = _.clamp(x, 0, this._svgWidth);
            y = _.clamp(y, 0, this._svgHeight);
        }

        let transform = `translate(${x}, ${y})`;
        $(dot)
            .attr("transform", transform)
            .data("position", new Coordinate(x, y));

        let id = $(dot).data("dot").id;
        this._svg.select(`.dot-label-${id}`)
            .attr("transform", transform);
    }

    /**
     * Trigger redrawing zoom-dependent aspects next time draw() is called.
     */
    redrawZoom() {
        this._redrawZoom = true;
    }

    /**
     * Select the given dots.
     *
     * @param {jQuery} dots
     */
    selectDots(dots) {
        d3.selectAll(dots).classed("selected", true);
    }

    /**
     * Set a Grapher option. Will not go into effect until draw() has been called again. The
     * available options are:
     *  - {boolean} [backgroundVisible=false] - If true, show the background image for a sheet
     *  - {boolean} [boundDots=false] - If true, prevent dots from going out of the SVG.
     *  - {string} [dotFormat="none"] - The format to draw the dots. The available formats
     *    are: none, orientation, dot-type.
     *  - {boolean} [draw4Step=false] - If true, draws 4 step lines.
     *  - {boolean} [drawYardlineNumbers=false] - If true, draws yardline numbers.
     *  - {boolean} [drawYardlines=true] - If true, draw yardlines and hashes.
     *  - {boolean} [expandField=false] - If true, expand the boundaries of the field beyond the
     *    field (and fieldPadding).
     *  - {number} [fieldPadding=30] - The minimum amount of space between the field and the SVG.
     *  - {boolean} [labelLeft=true] - If true, show the label on the left of the dot.
     *  - {boolean} [showCollisions=false] - If true, color dots less than 1 step spacing away
     *  - {boolean} [showLabels=false] - If true, show the label next to each dot.
     *  - {?number} [zoom=null] - If null, use the dimensions of the draw target as the dimensions
     *    of the field. If a number, zoom the field to the given ratio.
     */
    setOption(name, val) {
        this._options[name] = val;
    }

    /**
     * Set multiple options at once. @see setOption
     *
     * @param {Object} options
     */
    setOptions(options) {
        _.assign(this._options, options);
    }

    /**
     * @param {boolean} [visible] - If true, show the background image; otherwise, hide the
     *   background image. If undefined, use the backgroundVisible option.
     */
    showBackground(visible=this._options.backgroundVisible) {
        this.setOption("backgroundVisible", visible);
        this._svg.select("image.background-image").style("display", visible ? "block" : "none");
    }

    /**
     * Change the zoom by the given amount. Won't take effect until draw() is called again.
     *
     * @param {number} delta
     */
    zoom(delta) {
        let zoom = _.defaultTo(this._options.zoom, 1);
        this._options.zoom = zoom + delta;
    }

    /**** HELPERS ****/

    /**
     * Draw the dots in the given Sheet at the given beat onto the SVG.
     *
     * @param {Sheet} sheet - The sheet to draw.
     * @param {int} currentBeat - Beat to draw, relative to the start of the Sheet.
     */
    _drawDots(sheet, currentBeat) {
        let _this = this;
        let options = this._options;
        let dotRadius = this.getDotRadius();

        // group containing all dots
        let dotsGroup = this._svg.select("g.dots");
        if (dotsGroup.empty()) {
            dotsGroup = this._svg.append("g").classed("dots", true);
        }

        // separate labels from dots to keep in a separate layer
        let labelsGroup = this._svg.select("g.dot-labels");
        if (!options.showLabels) {
            labelsGroup.remove();
        } else if (labelsGroup.empty()) {
            labelsGroup = this._svg.append("g").classed("dot-labels", true);
        }

        let drawDot = dot => {
            let dotGroup = dotsGroup.append("g");

            if (options.dotFormat === "dot-type") {
                dotGroup.append("line").classed("fslash", true);
                dotGroup.append("line").classed("bslash", true);
            }
            dotGroup.append("circle").classed("dot-marker", true);

            let dotLabel;
            if (options.showLabels) {
                dotLabel = labelsGroup.append("text")
                    .classed(`dot-label dot-label-${dot.id}`, true)
                    .text(dot.label);
            }

            return [dotGroup, dotLabel];
        };

        let getState = dot => {
            let state;
            try {
                state = sheet.getAnimationState(dot, currentBeat);
            } catch (e) {
                state = null;
            }

            if (state) {
                return state;
            }

            // ran out of movements or no movements for dot
            let position = currentBeat === 0 ?
                sheet.getPosition(dot) :
                sheet.getFinalPosition(dot);

            // face sheet orientation
            let orientation = sheet.getOrientationDegrees();
            return new AnimationState(position, orientation);
        };

        // order dots in reverse order so that lower dot values are drawn on top
        // of higher dot values
        let dots = this._show.getDots();
        _.clone(dots).reverse().forEach(dot => {
            let dotGroup = dotsGroup.select(`.dot-${dot.id}`);
            let dotLabel = labelsGroup.select(`.dot-label-${dot.id}`);

            if (dotGroup.empty()) {
                let temp = drawDot(dot);
                dotGroup = temp[0];
                dotLabel = temp[1];
            }

            // save dot in jQuery data
            let $dot = $.fromD3(dotGroup).data("dot", dot);

            let state = getState(dot);
            let x = this._scale.toDistanceX(state.x);
            let y = this._scale.toDistanceY(state.y);
            this.moveDotTo($dot, x, y);

            // overwrite dot class each time
            let dotClass = "";
            switch (options.dotFormat) {
                case "orientation":
                    dotClass = getNearestOrientation(state.angle);
                    break;
                case "dot-type":
                    dotClass = sheet.getDotType(dot);
                    break;
            }
            dotGroup.attr("class", `dot ${dotClass} dot-${dot.id}`);

            if (this._redrawZoom) {
                dotGroup.select(".dot-marker")
                    .attr("r", dotRadius);

                let start = -1.1 * dotRadius;
                let end = 1.1 * dotRadius;

                dotGroup.select(".fslash")
                    .attr("x1", start)
                    .attr("y1", end)
                    .attr("x2", end)
                    .attr("y2", start);

                dotGroup.select(".bslash")
                    .attr("x1", start)
                    .attr("y1", start)
                    .attr("x2", end)
                    .attr("y2", end);

                if (options.showLabels) {
                    dotLabel.attr("font-size", dotRadius * 2);
                    let width = $.fromD3(dotLabel).getDimensions().width
                    let offsetX = 1.25 * width;
                    let offsetY = -1.25 * dotRadius;
                    if (options.labelLeft) {
                        offsetX *= -1;
                    }
                    dotLabel.attr("x", offsetX).attr("y", offsetY);
                }
            }
        });

        if (options.showCollisions) {
            sheet.getCollisions(currentBeat).forEach(dot => {
                this.getDot(dot).addClass("collision");
            });
        }

        this._redrawZoom = false;
    }

    /**
     * Get the FieldGrapher of the given type.
     *
     * @param {string} fieldType - The field type of the FieldGrapher to get. Options are:
     *   - college: CollegeGrapher
     * @param {number} svgWidth - The width of the SVG to pass to the FieldGrapher.
     * @param {number} svgHeight - The height of the SVG to pass to the FieldGrapher.
     * @return {FieldGrapher}
     */
    _getFieldGrapher(fieldType, svgWidth, svgHeight) {
        switch (fieldType) {
            case "college":
                return new CollegeGrapher(this._svg, svgWidth, svgHeight, this._options);
            default:
                throw new Error(`No FieldGrapher of type: ${fieldType}`);
        }
    }
}
