var BaseGrapher = require("./BaseGrapher");
var JSUtils = require("utils/JSUtils");

var HASH_WIDTH = 10;

/**
 * A BaseGrapher that graphs a a representation of a college football field
 */
var CollegeGrapher = function(show, drawTarget, options) {
    BaseGrapher.call(this, show, drawTarget, options);
};

JSUtils.extends(CollegeGrapher, BaseGrapher);

CollegeGrapher.prototype.FIELD_HEIGHT = 84;
CollegeGrapher.prototype.FIELD_WIDTH = 160;

CollegeGrapher.prototype.drawField = function() {
    var _this = this;
    var field = this._svg.append("g").classed("field field-college", true);

    // GrapherScale aliases
    var xScale = this._scale.xScale;
    var yScale = this._scale.yScale;
    var EAST = this._scale.maxY;
    var SOUTH = this._scale.minX;
    var WEST = this._scale.minY;
    var NORTH = this._scale.maxX;
    
    // field background
    field.append("rect")
        .attr("class", "field-background")
        .attr("width", this._svgWidth)
        .attr("height", this._svgHeight);

    // sideline box/field border
    field.append("rect")
        .attr("class", "field-border")
        .attr("width", this._scale.width)
        .attr("height", this._scale.height)
        .attr("x", SOUTH)
        .attr("y", WEST);

    if (this._options.drawYardlines === false) {
        return;
    }

    var yardlineSteps = JSUtils.range(8, 160, 8);

    // append the yardlines, excluding the 0 yardlines
    field.selectAll("line.yardline")
        .data(yardlineSteps)
        .enter()
        .append("line")
        .classed("yardline", true)
        .attr("x1", xScale)
        .attr("y1", WEST)
        .attr("x2", xScale)
        .attr("y2", EAST);

    if (this._options.drawYardlineNumbers) {
        var yardlineLabels = field
            .selectAll("text.yardline-label")
            .data(JSUtils.range(0, 210, 5))
            .enter()
            .append("text")
            .classed("yardline-label", true)
            .text(function(d) {
                // numbers 105-210 are on the bottom of the field
                if (d > 100) {
                    d -= 105;
                }

                if (d > 50) {
                    return 100 - d;
                } else {
                    return d;
                }
            })
            .each(function(d) {
                var label = d3.select(this);

                if (d > 100) {
                    var height = parseFloat(label.style("height"));
                    var y = EAST + height;
                    d -= 105;
                } else {
                    var y = WEST - 5;
                }

                var width = parseFloat(label.style("width"));
                var x = xScale(d * 8/5) - width/2;

                label.attr("x", x).attr("y", y);
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
            .classed("hash", true)
            .attr("y1", yScale(steps))
            .attr("y2", yScale(steps))
            .each(function(d) {
                var offsetX = xScale(d);
                d3.select(this)
                    .attr("x1", offsetX - HASH_WIDTH / 2)
                    .attr("x2", offsetX + HASH_WIDTH / 2);
            });
    });

    if (this._options.draw4Step) {
        field.selectAll("line.four-step")
            .data(JSUtils.range(40)) // 20 horizontal, 20 vertical
            .enter()
            .append("line")
            .classed("four-step", true)
            .each(function(d) {
                var x1 = SOUTH;
                var x2 = NORTH;
                var y1 = WEST;
                var y2 = EAST;

                if (d < 20) {
                    // horizontal
                    y1 = yScale(d * 4 + 4);
                    y2 = y1;
                } else {
                    // vertical
                    x1 = xScale((d - 20) * 8 + 4);
                    x2 = x1;
                }

                d3.select(this)
                    .attr("x1", x1)
                    .attr("y1", y1)
                    .attr("x2", x2)
                    .attr("y2", y2);
            });
    }
};

module.exports = CollegeGrapher;
