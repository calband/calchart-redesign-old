// the minimum amount of space between the field and the SVG
var FIELD_PADDING = 10;

/**
 * A BaseGrapher can draw moments of a field show. Needs to be subclassed by a
 * class implementing _drawField() and defining HEIGHT and WIDTH.
 *
 * @param {Show} show -- the Show this Grapher is graphing
 * @param {jQuery} drawTarget -- the HTML element which the Grapher will draw to
 */
var BaseGrapher = function(show, drawTarget) {
    this._show = show;
    this._drawTarget = drawTarget;

    // maps dot label to dot SVG element
    this._dots = {};

    this._svgWidth = this._drawTarget.width();
    this._svgHeight = this._drawTarget.height();

    this._svg = d3.select(this._drawTarget.get(0))
        .append("svg")
        .attr("class", "graph")
        .attr("width", this._svgWidth)
        .attr("height", this._svgHeight);
};

/**
 * Subclasses need to define these variables, representing the number of steps
 * for the field's dimensions
 */
BaseGrapher.prototype.FIELD_HEIGHT = null;
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
    var dots = this._show.getDots();

    // TODO

    // var scale = this._getStepScale();
    // var angleScale = this._getAngleScale();

    // var classForDot = function (dot) {
    //     var dotClass = "dot ";
    //     if (dot.getLabel() === selectedDotLabel) {
    //         dotClass += "selected";
    //     } else {
    //         dotClass += angleScale(dot.getAnimationState(currentBeat).angle);
    //     }
    //     return dotClass;
    // };

    // // pixels, represents length and width since the dots are square. Size is proportional
    // // to the size of the field (ratio adjusted manually)
    // var dotRectSize = this._svgWidth / 120;

    // var dotsGroup = this._svg.append("g")
    //     .attr("class", "dots");

    // dotsGroup.selectAll("rect.dot")
    //     .data(dots)
    //     .enter()
    //     .append("rect")
    //         .attr("class", classForDot)
    //         .attr("x", function (dot) { return scale.x(dot.getAnimationState(currentBeat).x) - dotRectSize / 2; })
    //         .attr("y", function (dot) { return scale.y(dot.getAnimationState(currentBeat).y) - dotRectSize / 2; })
    //         .attr("width", dotRectSize)
    //         .attr("height", dotRectSize)
    //         .style("cursor", "pointer")
    //         .on("click", function (dot) {
    //             var label = dot.getLabel();
    //             $(".js-dot-labels option[data-dot-label=" + label + "]").prop("selected", true);
    //             $(".js-dot-labels")
    //                 .trigger("chosen:updated")
    //                 .trigger("change", {selected: label});
    //         });

    // var selectedDot = sheet.getDotByLabel(selectedDotLabel);
    // if (selectedDot) {
    //     var circleSize = dotRectSize * 2;
    //     var circleX = scale.x(selectedDot.getAnimationState(currentBeat).x);
    //     var circleY = scale.y(selectedDot.getAnimationState(currentBeat).y);
    //     dotsGroup.append("circle")
    //         .attr("class", "selected-dot-highlight")
    //         .attr("cx", circleX)
    //         .attr("cy", circleY)
    //         .attr("r", dotRectSize * 2);
    // }
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
    var fieldWidth = this._svgWidth - 2 * FIELD_PADDING;
    var fieldHeight = fieldWidth * this.FIELD_HEIGHT / this.FIELD_WIDTH;

    if (fieldHeight > this._svgHeight) {
        fieldHeight = this._svgHeight - 2 * FIELD_PADDING;
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

/**
 * Return a d3 scale which maps an angle between 0 and 360 to the name of
 * the nearest direction, which will be selected and colored in the CSS.
 * 
 * This is a d3 quantize scale, which means that it has a continuous domain but
 * a discrete range: d3 automatically looks at the size of the range and the
 * bounds of the input domain and returns a function that maps the domain to
 * the range in even steps.
 * @return {function(Number):string} function converts angle to direction string
 */
BaseGrapher.prototype._getAngleScale = function() {
    return d3.scale.quantize()
        .domain([0, 360])
        .range(["facing-east", "facing-south", "facing-west", "facing-north"]);
};

module.exports = BaseGrapher;
