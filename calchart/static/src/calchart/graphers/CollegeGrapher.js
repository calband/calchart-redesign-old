var BaseGrapher = require("./BaseGrapher");
var JSUtils = require("../../utils/JSUtils");

var HASH_WIDTH = 10;

/**
 * A BaseGrapher that graphs a a representation of a college football field
 *
 * Can take additional options including:
 *   - {boolean} drawYardlineNumbers -- if true, draws yardline numbers
 *     (default false)
 */
var CollegeGrapher = function(show, drawTarget, options) {
    BaseGrapher.call(this, show, drawTarget, options);
};

JSUtils.extends(CollegeGrapher, BaseGrapher);

CollegeGrapher.prototype.FIELD_HEIGHT = 84;
CollegeGrapher.prototype.FIELD_WIDTH = 160;

CollegeGrapher.prototype._drawField = function() {
    var _this = this;
    var dimensions = this._getDimensions();
    var scale = this._getStepScale();
    var field = this._svg.append("g").attr("class", "field field-college");
    
    // field background
    field.append("rect")
        .attr("class", "field-background")
        .attr("width", this._svgWidth)
        .attr("height", this._svgHeight);

    // sideline box/field border
    field.append("rect")
        .attr("class", "field-border")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        .attr("x", scale.x(0))
        .attr("y", scale.y(0));

    var yardlineSteps = JSUtils.range(8, 160, 8);

    // append the yardlines, including the 0 yardlines
    field.selectAll("line.yardline")
        .data(yardlineSteps)
        .enter()
        .append("line")
        .attr("class", "yardline")
        .attr("x1", scale.x)
        .attr("y1", scale.y(0))
        .attr("x2", scale.x)
        .attr("y2", scale.y(this.FIELD_HEIGHT));

    if (this._options.drawYardlineNumbers) {
        var y = scale.y(this.FIELD_HEIGHT);
        var yardlineLabels = field
            .selectAll("text.yardline-label")
            .data(JSUtils.range(0, 105, 5))
            .enter()
            .append("text")
            .attr("class", "yardline-label")
            .text(function(d) {
                if (d > 50) {
                    return 100 - d;
                } else {
                    return d;
                }
            })
            .each(function(d) {
                var _this = d3.select(this);
                var x = scale.x(d * 8/5);
                var width = parseFloat(_this.style("width"));
                var height = parseFloat(_this.style("height"));

                _this.attr("x", x - width/2).attr("y", y + height);
            });
    }

    // draw hash marks
    [true, false].forEach(function(isBack) {
        var steps = isBack ? 32 : 52;
        var name = isBack ? "back-hash" : "front-hash";
        field.selectAll("line.hash." + name)
            .data(yardlineSteps)
            .enter()
            .append("line")
            .attr("class", "hash")
            .attr("y1", scale.y(steps))
            .attr("y2", scale.y(steps))
            .each(function(d) {
                var offsetX = scale.x(d);
                d3.select(this)
                    .attr("x1", offsetX - HASH_WIDTH / 2)
                    .attr("x2", offsetX + HASH_WIDTH / 2);
            });
    });
};

module.exports = CollegeGrapher;
