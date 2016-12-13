var CalchartUtils = require("../../utils/CalchartUtils");
var GrapherScale = require("../GrapherScale");

/**
 * A BaseGrapher can draw moments of a field show. Needs to be subclassed by a
 * class implementing _drawField() and defining HEIGHT and WIDTH.
 *
 * @param {Show} show -- the Show this Grapher is graphing
 * @param {jQuery} drawTarget -- the HTML element which the Grapher will draw to
 * @param {object} options -- options for the grapher. See BaseGrapher.setOption
 */
var BaseGrapher = function(show, drawTarget, options) {
    this._show = show;
    this._drawTarget = drawTarget;
    this._options = options || {};

    // maps dot label to dot SVG element
    this._dots = {};

    this._svgWidth = this._drawTarget.width();
    this._svgHeight = this._drawTarget.height();
    this._scale = new GrapherScale(this, this._svgWidth, this._svgHeight);

    // fraction of a step in pixels
    this._dotRadius = this._scale.toDistance(3/4);

    this._svg = d3.select(this._drawTarget.get(0))
        .append("svg")
        .attr("class", "graph")
        .attr("width", this._svgWidth)
        .attr("height", this._svgHeight);
};

/**
 * Subclasses need to define these variables
 */
// number of steps from east to west sideline
BaseGrapher.prototype.FIELD_HEIGHT = null;
// number of steps from north to south endzone
BaseGrapher.prototype.FIELD_WIDTH = null;

/**
 * Get the GrapherScale this Grapher is using
 *
 * @return {GrapherScale} the scale of the Grapher field
 */
BaseGrapher.prototype.getScale = function() {
    return this._scale;
};

/**
 * Draws the field, with a background, borders, yardlines, and hash marks. Subclasses
 * should implement this function to draw common field attributes
 */
BaseGrapher.prototype.drawField = function() {
    throw new Error("BaseGrapher subclasses need to implement _drawField");
};

/**
 * Draws a moment in a field show. The moment is given as a beat of a
 * particular stuntsheet.
 *
 * @param {Stuntsheet} sheet -- the stuntsheet to draw.
 * @param {int} currentBeat -- the beat to draw, relative to the
 *   start of the stuntsheet.
 * @param {Array<string>} selectedDots -- labels of selected dots
 */
BaseGrapher.prototype.draw = function(sheet, currentBeat, selectedDots) {
    var fieldType = sheet.getFieldType();
    var field = this._svg.select(".field");

    // re-draw field if no field is drawn or if the drawn field is of the wrong type
    if (field.empty() || !field.classed("field-" + fieldType)) {
        field.remove();
        this.drawField();
    }

    this._drawDots(currentBeat, selectedDots);
};

/**
 * Clear the Grapher of all the dots (i.e. keeping the field)
 */
BaseGrapher.prototype.clearDots = function() {
    this._svg.find(".dots").remove();
};

/**
 * Return the dots contained in the grapher
 *
 * @return {jQuery} the dots in the grapher
 */
BaseGrapher.prototype.getDots = function() {
    return $(this._svg.selectAll("g.dot"));
};

/**
 * Clear the Grapher of all graphics
 */
BaseGrapher.prototype.clear = function() {
    this._svg.empty();
};

/**
 * Sets a Grapher option. The available options are:
 *  - {boolean} circleSelected -- if true, circles the selected dot, or the last
 *    selected dot, if multiple (default false)
 *  - {boolean} showLabels -- if true, show the label next to each dot (default false)
 *  - {boolean} labelLeft -- if true, show the label on the left of the dot (default true)
 *  - {boolean} drawYardlineNumbers -- if true, draws yardline numbers (default false)
 *  - {boolean} draw4Step -- if true, draws 4 step lines (default false)
 */
BaseGrapher.prototype.setOption = function(name, val) {
    this._options[name] = val;
};

/**
 * Given a stuntsheet, the currentBeat relative to the beginning of that sheet,
 * and the dot labels of all selected dots, draw the dots in this stuntsheet at
 * that beat onto the SVG context of this grapher.
 *
 * @param {int} currentBeat -- beat of stuntsheet to draw
 * @param {Array<string>} selectedDots -- labels of selected dots
 */
BaseGrapher.prototype._drawDots = function(currentBeat, selectedDots) {
    var _this = this;
    // group containing all dots
    var dotsGroup = this._svg.append("g").classed("dots", true);
    // each dot consists of a group containing all svg elements making up a dot
    var dotGroups = dotsGroup.selectAll("g.dot").data(this._show.getDots());

    if (dotGroups.empty()) {
        dotGroups = dotGroups.enter()
            .append("g")
            .classed("dot", true);
    }
    
    dotGroups.each(function(dot) {
        var label = dot.getLabel();
        var state = dot.getAnimationState(currentBeat);
        var x = _this._scale.xScale(state.x);
        var y = _this._scale.yScale(state.y);

        if (selectedDots.indexOf(label) === -1) {
            var dotClass = CalchartUtils.getNearestOrientation(state.angle);
        } else {
            var dotClass = "selected";
        }

        var dotGroup = d3.select(this);
        var dotMarker = dotGroup.selectAll(".dot-marker");
        if (dotMarker.empty()) {
            dotMarker = dotGroup
                .append("circle")
                .attr("r", _this._dotRadius);
        }
        dotMarker.attr("class", "dot-marker " + dotClass);

        if (_this._options.circleSelected) {
            var circle = dotGroup.selectAll("circle.selected-circle");

            if (circle.empty()) {
                circle = dotGroup.append("circle")
                    .classed("selected-circle", true)
                    .attr("r", _this._dotRadius * 2);
            }
        }

        if (_this._options.showLabels) {
            var offsetX = -2.25 * _this._dotRadius;
            var offsetY = -1 * _this._dotRadius;

            if (_this._options.labelLeft === false) {
                offsetX *= -1;
            }

            var labelId = "dot-" + label;
            var dotLabel = dotGroup.select("#" + labelId);

            if (dotLabel.empty()) {
                dotLabel = dotGroup.append("text")
                    .attr("id", labelId)
                    .classed("dot-label", true)
                    .attr("font-size", _this._dotRadius * 2.5)
                    .text(label);
            }

            dotLabel.attr("x", offsetX).attr("y", offsetY);
        }

        _this.moveDot($(dotGroup[0]), x, y);
    });
};

/**
 * Moves the given dot to the given coordinates, which either represent the
 * center of the dot or the top-left corner of the dot.
 *
 * @param {jQuery} dot -- the dot to move
 * @param {float} x -- the x-coordinate of the dot's position
 * @param {float} y -- the y-coordinate of the dot's position
 * @param {boolean|undefined} isCorner -- if true, the (x,y) coordinate represents
 *   the top left corner of the dot, and needs to be adjusted.
 */
BaseGrapher.prototype.moveDot = function(dot, x, y, isCorner) {
    if (isCorner) {
        var dotPosition = $(dot).position();
        var dotMarker = $(dot).find(".dot-marker").position();
        x += dotMarker.left + (this._dotRadius / 2) - dotPosition.left;
        y += dotMarker.top + (this._dotRadius / 2) - dotPosition.top;
    }

    $(dot).attr("transform", "translate(" + x + "," + y + ")");
};

module.exports = BaseGrapher;
