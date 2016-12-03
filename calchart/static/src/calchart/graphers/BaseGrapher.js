var CalchartUtils = require("../../utils/CalchartUtils");

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
    this._scale = this._getStepScale();
    // fraction of a step in pixels
    this._dotRadius = (this._scale.x(1) - this._scale.x(0)) * 3/4;

    this._svg = d3.select(this._drawTarget.get(0))
        .append("svg")
        .attr("class", "graph")
        .attr("width", this._svgWidth)
        .attr("height", this._svgHeight);
};

/**
 * Subclasses need to define these variables
 */
// the minimum amount of space between the field and the SVG
BaseGrapher.prototype.FIELD_PADDING = 30;
// number of steps from east to west sideline
BaseGrapher.prototype.FIELD_HEIGHT = null;
// number of steps from north to south endzone
BaseGrapher.prototype.FIELD_WIDTH = null;

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
    var fieldType = sheet ? sheet.getFieldType() : this._show.getFieldType();
    var field = this._drawTarget.find(".field");

    // draw field if no field is drawn or if the drawn field is of the wrong type
    if (field.length === 0 || !field.hasClass("field-" + fieldType)) {
        field.remove();
        this._drawField();
    }

    if (sheet) {
        this._drawDots(currentBeat, selectedDots);
    }
};

/**
 * Clear the Grapher of all the dots (i.e. keeping the field)
 */
BaseGrapher.prototype.clearDots = function() {
    this._svg.find(".dots").remove();
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
 */
BaseGrapher.prototype.setOption = function(name, val) {
    this._options[name] = val;
};

/**
 * Draws the field, with a background, borders, yardlines, and hash marks. Subclasses
 * should call this function to draw common field attributes
 */
BaseGrapher.prototype._drawField = function() {
    throw new Error("BaseGrapher subclasses need to implement _drawField");
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
    var dotsGroup = this._svg.append("g").attr("class", "dots");
    var dots = dotsGroup.selectAll("circle.dot").data(this._show.getDots());

    if (dots.empty()) {
        dots = dots.enter()
            .append("circle")
            .attr("r", this._dotRadius);
    }
    
    dots.each(function(dot) {
        var label = dot.getLabel();
        var state = dot.getAnimationState(currentBeat);
        var x = _this._scale.x(state.x);
        var y = _this._scale.y(state.y);

        if (selectedDots.indexOf(label) === -1) {
            var dotClass = "facing-" + CalchartUtils.getNearestOrientation(state.angle);
        } else {
            var dotClass = "selected";
        }

        d3.select(this)
            .attr("class", "dot " + dotClass)
            .attr("cx", x)
            .attr("cy", y);

        if (_this._options.circleSelected) {
            var circle = dotsGroup.selectAll("circle.selected-circle");

            if (circle.empty()) {
                circle = dotsGroup.append("circle")
                    .attr("class", "selected-circle")
                    .attr("r", _this._dotRadius * 2);
            }

            circle.attr("cx", x).attr("cy", y);
        }

        if (_this._options.showLabels) {
            var offsetX = -2.25 * _this._dotRadius;
            var offsetY = -1 * _this._dotRadius;

            if (_this._options.labelLeft === false) {
                offsetX *= -1;
            }

            var labelId = "dot-" + label;
            var dotLabel = dotsGroup.select("#" + labelId);

            if (dotLabel.empty()) {
                dotLabel = dotsGroup.append("text")
                    .attr("id", labelId)
                    .attr("class", "dot-label")
                    .attr("font-size", _this._dotRadius * 2.5)
                    .text(label);
            }

            dotLabel.attr("x", x + offsetX).attr("y", y + offsetY);
        }
    });
};

/**
 * Return the width and height of the field, keeping the aspect ratio from FIELD_HEIGHT
 * and FIELD_WIDTH.
 *
 * @return {object} an object of the form {width: <width>, height: <height>}, where
 *   <width> and <height> are the width and height of the field as floats.
 */
BaseGrapher.prototype._getDimensions = function() {
    // keep aspect ratio of width/height
    var fieldWidth = this._svgWidth - 2 * this.FIELD_PADDING;
    var fieldHeight = fieldWidth * this.FIELD_HEIGHT / this.FIELD_WIDTH;

    if (fieldHeight > this._svgHeight) {
        fieldHeight = this._svgHeight - 2 * this.FIELD_PADDING;
        fieldWidth = fieldHeight * this.FIELD_WIDTH / this.FIELD_HEIGHT;
    }

    return {
        width: fieldWidth,
        height: fieldHeight
    };
};

/**
 * Return two d3 scales mapping steps from the top/left of the field to the corresponding
 * number of pixels from the bottom/left of the SVG. The scale is determined by the values
 * set for FIELD_HEIGHT and FIELD_WIDTH.
 *
 * Note: this scale takes padding into account: its output is relative to the entire
 * svg container, not just the field area of the svg.
 *
 * @return {object} an object of the form {x: <scale>, y: <scale>}, where <scale> is a function
 *   that takes in a number from 0 to FIELD_HEIGHT/FIELD_WIDTH and returns the corresponding x/y
 *   value in the SVG
 */
BaseGrapher.prototype._getStepScale = function() {
    var dimensions = this._getDimensions();

    var xOffset = (this._svgWidth - dimensions.width) / 2;
    var yOffset = (this._svgHeight - dimensions.height) / 2;

    var xScale = d3.scale.linear()
        .domain([0, this.FIELD_WIDTH])
        .range([xOffset, xOffset + dimensions.width]);
    var yScale = d3.scale.linear()
        .domain([0, this.FIELD_HEIGHT])
        .range([yOffset, yOffset + dimensions.height]);

    return {
        x: xScale,
        y: yScale
    };
};

module.exports = BaseGrapher;
