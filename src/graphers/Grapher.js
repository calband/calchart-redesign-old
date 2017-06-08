import AnimationState from "calchart/AnimationState";
import Coordinate from "calchart/Coordinate";
import Dot from "calchart/Dot";
import CollegeGrapher from "graphers/CollegeGrapher";

import { getNearestOrientation } from "utils/CalchartUtils";

if (_.isUndefined(d3)) {
    console.error("D3 is not loaded!");
}

export const FIELD_GRAPHERS = {
    college: CollegeGrapher,
};

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
            dotRadius: 0.75,
            draw4Step: false,
            drawYardlineNumbers: false,
            drawYardlines: true,
            eastUp: false,
            expandField: false,
            fieldPadding: 30,
            labelLeft: true,
            onZoom: null,
            showCollisions: false,
            showLabels: false,
            zoom: 1,
            zoomable: false,
        });

        // // true to trigger drawing zoom-dependent aspects of the grapher; to
        // // avoid redundant calculations in _drawDots
        // this._redrawZoom = true;

        // {GrapherScale}
        this._scale = null;

        this._svg = d3.select(this._drawTarget.get(0))
            .append("svg")
            .attr("class", "graph");

        this._svgWidth = undefined;
        this._svgHeight = undefined;

        if (this._options.zoomable) {
            let sensitivity = this._drawTarget.width() / 10;
            this._drawTarget
                .css("overflow", "auto")
                .pinch(e => {
                    e.preventDefault();
                    this.zoomBy(e.deltaY / sensitivity, e);
                });
        }

        this.drawField();
        this._drawDots();
        this._redrawDots();

        if (this._options.expandField) {
            this._drawTarget.scrollLeft(this._scale.minX - 30);
            this._drawTarget.scrollTop(this._scale.minY - 30);
        }
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
        if (field.empty() || !field.classed(`field-${fieldType}`)) {
            field.remove();
            this.drawField(fieldType);
            field = this._svg.select("g.field");
        }

        // add/remove background image element
        let background = sheet.getBackground();
        let image = field.select("image.background-image");
        if (_.isUndefined(background)) {
            image.remove();
        } else {
            if (image.empty()) {
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

        this._updateDots(sheet, currentBeat);
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

        this._svgWidth = this._drawTarget.width() * this._options.zoom;
        this._svgHeight = this._drawTarget.height() * this._options.zoom;

        let fieldGrapher = this._getFieldGrapher(fieldType);
        fieldGrapher.drawField();
        this._scale = fieldGrapher.getScale();
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
        let dotGroups = $.fromD3(this._svg.selectAll("g.dot"));
        if (dots) {
            if (dots[0] instanceof Dot) {
                dots = dots.map(dot => dot.id);
            }
            dotGroups = dotGroups.filter((i, dot) =>
                _.includes(dots, $(dot).data("dot").id)
            );
        }
        return dotGroups;
    }

    /**
     * @return {number} The radius of the dots in the Grapher.
     */
    getDotRadius() {
        return this._scale.toDistance(this._options.dotRadius);
    }

    /**
     * @return {jQuery} The SVG graph element.
     */
    getGraph() {
        return $.fromD3(this._svg);
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
     * Redraw the graph after zooming, keeping the given coordinate
     * in the same place afterwards.
     *
     * @param {number} [pageX] - The x-coordinate in the page to zoom
     *   into/out of. Defaults to the center of the graph.
     * @param {number} [pageY] - The y-coordinate in the page to zoom
     *   into/out of. Defaults to the center of the graph.
     */
    redrawZoom(pageX, pageY) {
        // distance from top-left corner of draw target
        let left, top;
        let offset = this._drawTarget.offset();
        if (_.isUndefined(pageX)) {
            left = this._drawTarget.width() / 2;
        } else {
            left = pageX - offset.left;
        }
        if (_.isUndefined(pageY)) {
            top = this._drawTarget.height() / 2;
        } else {
            top = pageY - offset.top;
        }

        // steps from top-left corner of field
        let start = this._scale.toSteps({
            x: this._drawTarget.scrollLeft() + left,
            y: this._drawTarget.scrollTop() + top,
        });

        this.clearField();
        this.drawField();
        this._redrawDots();

        // scroll draw target to keep same location under cursor
        let end = this._scale.toDistance(start);
        this._drawTarget.scrollLeft(end.x - left);
        this._drawTarget.scrollTop(end.y - top);

        if (this._options.onZoom) {
            this._options.onZoom(this);
        }
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
     *  - {number} [dotRadius=0.75] - The radius of the dots to draw
     *  - {boolean} [draw4Step=false] - If true, draws 4 step lines.
     *  - {boolean} [drawYardlineNumbers=false] - If true, draws yardline numbers.
     *  - {boolean} [drawYardlines=true] - If true, draw yardlines and hashes.
     *  - {boolean} [eastUp=false] - If true, orient the field to have the east side be the top
     *    edge. By default, draws the west side on top.
     *  - {boolean} [expandField=false] - If true, expand the boundaries of the field beyond the
     *    field (and fieldPadding).
     *  - {number} [fieldPadding=30] - The minimum amount of space between the field and the SVG,
     *    in pixels.
     *  - {boolean} [labelLeft=true] - If true, show the label on the left of the dot.
     *  - {function} [onZoom] - If given, runs the given function whenever the graph is redrawn
     *    due to zooming. Receives the Grapher as a parameter.
     *  - {boolean} [showCollisions=false] - If true, color dots less than 1 step spacing away
     *  - {boolean} [showLabels=false] - If true, show the label next to each dot.
     *  - {number} [zoom=1] - The ratio to zoom the field to. A ratio of 1 means the graph exactly
     *    fills the draw target.
     *  - {boolean} [zoomable=false] - If true, allow the user to pinch (or ctrl+scroll) to zoom.
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
        this._options.backgroundVisible = visible;
        this._svg.select("image.background-image").style("display", visible ? "block" : "none");
    }

    /**
     * Zoom by the given value.
     *
     * @param {number} delta
     * @param {Event} [e] - If given, zoom keeping the same coordinates under
     *   the mouse.
     */
    zoomBy(delta, e={}) {
        this.zoomTo(this._options.zoom + delta, e);
    }

    /**
     * Zoom to the given value.
     *
     * @param {number} zoom
     * @param {Event} [e] - If given, zoom keeping the same coordinates under
     *   the mouse.
     */
    zoomTo(zoom, e={}) {
        this._options.zoom = Math.max(zoom, 1);
        this.redrawZoom(e.pageX, e.pageY);
    }

    /**** HELPERS ****/

    /**
     * Draw all dot elements onto the graph.
     */
    _drawDots() {
        // group containing all dots
        let dotsGroup = this._svg.append("g").classed("dots", true);

        // separate labels from dots to keep in a separate layer
        let labelsGroup = this._svg.append("g").classed("dot-labels", true);
        if (!this._options.showLabels) {
            $.fromD3(labelsGroup).hide();
        }

        // order dots in reverse order so that lower dot values are drawn on top
        // of higher dot values
        let dots = this._show.getDots();
        _.clone(dots).reverse().forEach(dot => {
            let dotGroup = dotsGroup.append("g")
                .classed(`dot dot-${dot.id}`, true);

            if (this._options.dotFormat === "dot-type") {
                dotGroup.append("line").classed("fslash", true);
                dotGroup.append("line").classed("bslash", true);
            }
            dotGroup.append("circle").classed("dot-marker", true);

            labelsGroup.append("text")
                .classed(`dot-label dot-label-${dot.id}`, true)
                .text(dot.label);

            // save dot in jQuery data
            $.fromD3(dotGroup).data("dot", dot);
        });
    }

    /**
     * Get the FieldGrapher of the given type.
     *
     * @param {string} fieldType - The field type of the FieldGrapher to get.
     * @return {FieldGrapher}
     */
    _getFieldGrapher(fieldType) {
        let field = this._svg.insert("g", ":first-child")
            .classed(`field field-${fieldType}`, true);

        let options = _.clone(this._options);

        // expand field to a field and a half in each direction
        if (options.expandField) {
            options.fieldPadding += this._svgWidth * 1.5;
            this._svgWidth *= 4;
            this._svgHeight *= 4;
        }

        this._svg
            .attr("width", this._svgWidth)
            .attr("height", this._svgHeight);

        let FieldGrapher = FIELD_GRAPHERS[fieldType];
        if (FieldGrapher) {
            return new FieldGrapher(field, this._svgWidth, this._svgHeight, options);
        } else {
            throw new Error(`No FieldGrapher of type: ${fieldType}`);
        }
    }

    /**
     * Redraw zoom-dependent aspects of dots.
     */
    _redrawDots() {
        let dotRadius = this.getDotRadius();
        let start = -1.1 * dotRadius;
        let end = 1.1 * dotRadius;

        this._svg.selectAll(".dot-marker")
            .attr("r", dotRadius);

        this._svg.selectAll(".fslash")
            .attr("x1", start)
            .attr("y1", end)
            .attr("x2", end)
            .attr("y2", start);

        this._svg.selectAll(".bslash")
            .attr("x1", start)
            .attr("y1", start)
            .attr("x2", end)
            .attr("y2", end);

        this._svg.selectAll(".dot-label")
            .attr("font-size", dotRadius * 2);

        let dotLabels = this.getGraph().find(".dot-label");
        _.each(dotLabels, dotLabel => {
            let width = $(dotLabel).getDimensions().width;
            let offsetX = 1.25 * width;
            let offsetY = -1.25 * dotRadius;
            if (this._options.labelLeft) {
                offsetX *= -1;
            }
            $(dotLabel)
                .attr("x", offsetX)
                .attr("y", offsetY);
        });
    }

    /**
     * Update beat-specific aspects of a dot.
     */
    _updateDots(sheet, currentBeat) {
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

        this._show.getDots().forEach(dot => {
            let $dot = this.getDot(dot);

            let dotClass = "";
            switch (this._options.dotFormat) {
                case "orientation":
                    dotClass = getNearestOrientation(state.angle);
                    break;
                case "dot-type":
                    dotClass = sheet.getDotType(dot);
                    break;
            }

            // overwrite dot class each time
            $dot.attr("class", `dot dot-${dot.id} ${dotClass}`);

            let state = getState(dot);
            let position = this._scale.toDistance(state);
            this.moveDotTo($dot, position.x, position.y);
        });

        if (this._options.showCollisions) {
            sheet.getCollisions(currentBeat).forEach(dot => {
                this.getDot(dot).addClass("collision");
            });
        }
    }
}
