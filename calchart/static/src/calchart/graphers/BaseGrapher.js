/**
 * @fileOverview This file defines the BaseGrapher, the abstract superclass for field
 * graphers, objects that know how to graph a specific field. Functions in this file
 * are organized alphabetically in the following sections:
 *
 * - Constructor
 * - Abstract variables/methods (subclasses need to override these)
 * - Instance methods
 * - Helpers (prefixed with an underscore)
 */

var CalchartUtils = require("utils/CalchartUtils");
var GrapherScale = require("calchart/GrapherScale");

/**** CONSTRUCTOR ****/

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

/**** ABSTRACT VARIABLES/METHODS ****/

/**
 * Subclasses need to define these variables
 */
// number of steps from east to west sideline
BaseGrapher.prototype.FIELD_HEIGHT = null;
// number of steps from north to south endzone
BaseGrapher.prototype.FIELD_WIDTH = null;

/**
 * Draws the field, with a background, borders, yardlines, and hash marks. Subclasses
 * should implement this function to draw common field attributes
 */
BaseGrapher.prototype.drawField = function() {
    throw new Error("BaseGrapher subclasses need to implement _drawField");
};

/**** INSTANCE METHODS ****/

/**
 * Clear the Grapher of all graphics
 */
BaseGrapher.prototype.clear = function() {
    this._svg.empty();
};

/**
 * Clear the Grapher of all the dots (i.e. keeping the field)
 */
BaseGrapher.prototype.clearDots = function() {
    this._svg.find(".dots").remove();
};

/**
 * Draws a moment in a field show. The moment is given as a beat of a
 * particular stuntsheet.
 *
 * @param {Stuntsheet} sheet -- the stuntsheet to draw.
 * @param {int|undefined} currentBeat -- the beat to draw, relative to
 *   the start of the stuntsheet. Defaults to 0.
 * @param {Array<string>|undefined} selectedDots -- labels of selected dots
 */
BaseGrapher.prototype.draw = function(sheet, currentBeat, selectedDots) {
    currentBeat = currentBeat || 0;
    selectedDots = selectedDots || [];

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
 * Return the dots contained in the grapher
 *
 * @return {jQuery} the dots in the grapher
 */
BaseGrapher.prototype.getDots = function() {
    return $(this._svg.selectAll("g.dot")[0]);
};

/**
 * Get the GrapherScale this Grapher is using
 *
 * @return {GrapherScale} the scale of the Grapher field
 */
BaseGrapher.prototype.getScale = function() {
    return this._scale;
};

/**
 * @return {boolean} true if the dot has moved (i.e. called moveDot, but
 *   did not call savePosition)
 */
BaseGrapher.prototype.hasMoved = function(dot) {
    var oldPosition = $(dot).data("position");
    var newPosition = this._parsePosition(dot);
    return oldPosition.x !== newPosition.x || oldPosition.y !== newPosition.y;
};

/**
 * Moves the given dot to the given coordinates, which either represent the
 * center of the dot or the top-left corner of the dot.
 *
 * @param {jQuery} dot -- the dot to move
 * @param {float} x -- the x-coordinate of the dot's position, in pixels
 * @param {float} y -- the y-coordinate of the dot's position, in pixels
 * @param {object|undefined} options -- options for moving the dot, including
 *   the following options:
 *     - {boolean} transition -- true if this is a transitionary movement (so
 *       don't save position)
 */
BaseGrapher.prototype.moveDot = function(dot, x, y, options) {
    options = options || {};

    // contain dot in workspace
    x = Math.min(Math.max(0, x), this._svgWidth);
    y = Math.min(Math.max(0, y), this._svgHeight);

    $(dot).attr("transform", "translate(" + x + "," + y + ")");

    if (!options.transition) {
        this.savePosition(dot);
    }
};

/**
 * Save the given dot's position
 *
 * @param {jQuery} dot -- the dot whose position should be saved
 * @return {object} the position of the dot
 */
BaseGrapher.prototype.savePosition = function(dot) {
    var position = this._parsePosition(dot);
    $(dot).data("position", position);
    return position;
};

/**
 * Sets a Grapher option. The available options are:
 *  - {boolean} circleSelected -- if true, circles the selected dot, or the last
 *    selected dot, if multiple (default false)
 *  - {boolean} showLabels -- if true, show the label next to each dot (default false)
 *  - {boolean} labelLeft -- if true, show the label on the left of the dot (default true)
 *  - {boolean} drawYardlineNumbers -- if true, draws yardline numbers (default false)
 *  - {boolean} draw4Step -- if true, draws 4 step lines (default false)
 *  - {boolean} drawDotType -- if true, draw dots according to their dot type. If false,
 *    colors dots differently based on their orientation (default false)
 */
BaseGrapher.prototype.setOption = function(name, val) {
    this._options[name] = val;
};

/**
 * Rebinds this._svg to svg.graph, in the case of cloning the graph when
 * undoing an action.
 */
BaseGrapher.prototype.rebindSVG = function() {
    this._svg = d3.select("svg.graph");
};

/**** HELPERS ****/

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
    var dotsGroup = this._svg.select("g.dots");
    if (dotsGroup.empty()) {
        dotsGroup = this._svg.append("g").classed("dots", true);
    }

    // order dots in reverse order so that lower dot values are drawn on top
    // of higher dot values
    var dots = this._show.getDots().sort(function(dot1, dot2) {
        return -1 * dot1.compareTo(dot2);
    });
    // each dot consists of a group containing all svg elements making up a dot
    var dotGroups = dotsGroup.selectAll("g.dot").data(dots);
    if (dotGroups.empty()) {
        dotGroups = dotGroups.enter()
            .append("g")
            .attr("id", function(dot) {
                return "dot-" + dot.getLabel();
            })
            .attr("class", function(dot) {
                var dotClass = "dot ";
                if (_this._options.drawDotType) {
                    dotClass += dot.getDotType();
                }
                return dotClass;
            });
    }
    
    dotGroups.each(function(dot) {
        var label = dot.getLabel();
        // special case in case dots are positioned without having movements
        if (currentBeat === 0) {
            var state = dot.getPosition();
        } else {
            var state = dot.getAnimationState(currentBeat);
        }
        var x = _this._scale.xScale(state.x);
        var y = _this._scale.yScale(state.y);

        // save dot in jQuery data also
        $(this).data("dot", dot);

        var dotClass = "dot-marker ";

        if (selectedDots.indexOf(label) !== -1) {
            dotClass += "selected";
        } else if (!_this._options.drawDotType) {
            dotClass += CalchartUtils.getNearestOrientation(state.angle);
        }

        var dotGroup = d3.select(this);
        var dotMarker = dotGroup.selectAll(".dot-marker");
        if (dotMarker.empty()) {
            dotMarker = dotGroup
                .append("circle")
                .attr("r", _this._dotRadius);

            if (_this._options.drawDotType) {
                var start = -1.1 * _this._dotRadius;
                var end = 1.1 * _this._dotRadius;
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
            var offsetY = -1.25 * _this._dotRadius;

            if (_this._options.labelLeft === false) {
                offsetX *= -1;
            }

            var dotLabel = dotGroup.select(".dot-label");
            if (dotLabel.empty()) {
                dotLabel = dotGroup.append("text")
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
 * @param {jQuery} dot -- the dot to parse position of
 * @return {object} position of the dot, parsed from its transform
 *   attribute, in the form {x:x, y:y}
 */
BaseGrapher.prototype._parsePosition = function(dot) {
    var match = $(dot).attr("transform").match(/translate\(([\d\.]+),([\d\.]+)\)/);
    return {
        x: parseFloat(match[1]),
        y: parseFloat(match[2]),
    };
};

module.exports = BaseGrapher;
