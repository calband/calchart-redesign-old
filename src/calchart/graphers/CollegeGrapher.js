import FieldGrapher from "calchart/graphers/FieldGrapher";

let HASH_WIDTH = 10;

/**
 * A FieldGrapher that can draw a representation of a college football field.
 */
export default class CollegeGrapher extends FieldGrapher {
    get FIELD_HEIGHT() { return 84; }
    get FIELD_WIDTH() { return 160; }

    drawField() {
        // GrapherScale aliases
        let xScale = this._scale.xScale;
        let yScale = this._scale.yScale;
        let EAST = this._scale.maxY;
        let SOUTH = this._scale.minX;
        let WEST = this._scale.minY;
        let NORTH = this._scale.maxX;
        
        // field background
        this._field.append("rect")
            .attr("class", "field-background")
            .attr("width", this._svgWidth)
            .attr("height", this._svgHeight);

        // sideline box/field border
        this._field.append("rect")
            .attr("class", "field-border")
            .attr("width", this._scale.width)
            .attr("height", this._scale.height)
            .attr("x", SOUTH)
            .attr("y", WEST);

        if (this._options.drawYardlines === false) {
            return;
        }

        let yardlineSteps = _.range(8, 160, 8);

        // append the yardlines, excluding the 0 yardlines
        this._field.selectAll("line.yardline")
            .data(yardlineSteps)
            .enter()
            .append("line")
            .classed("yardline", true)
            .attr("x1", xScale)
            .attr("y1", WEST)
            .attr("x2", xScale)
            .attr("y2", EAST);

        // hash marks
        [true, false].forEach(isBack => {
            let y = yScale(isBack ? 32 : 52);
            let name = isBack ? "back-hash" : "front-hash";

            this._field.selectAll(`line.hash.${name}`)
                .data(yardlineSteps)
                .enter()
                .append("line")
                .classed(`hash ${name}`, true)
                .attr("y1", y)
                .attr("y2", y)
                .each(function(d) {
                    let offsetX = xScale(d);
                    d3.select(this)
                        .attr("x1", offsetX - HASH_WIDTH / 2)
                        .attr("x2", offsetX + HASH_WIDTH / 2);
                });
        });

        if (this._options.drawYardlineNumbers) {
            let fontSize = Math.max(this._scale.toDistance(3), 8);
            this._field
                .selectAll("text.yardline-label")
                .data(_.range(0, 210, 5))
                .enter()
                .append("text")
                .classed("yardline-label", true)
                .style("font-size", fontSize)
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
                    let label = d3.select(this);
                    let y;

                    if (d > 100) {
                        y = EAST + fontSize;
                        d -= 105;
                    } else {
                        y = WEST - fontSize / 3;
                    }

                    let width = parseFloat(label.style("width"));
                    let x = xScale(d * 8/5) - width/2;

                    label.attr("x", x).attr("y", y);
                });
        }

        if (this._options.draw4Step) {
            this._field.selectAll("line.four-step")
                .data(_.range(40)) // 20 horizontal, 20 vertical
                .enter()
                .append("line")
                .classed("four-step", true)
                .each(function(d) {
                    let x1 = SOUTH;
                    let x2 = NORTH;
                    let y1 = WEST;
                    let y2 = EAST;

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
    }
}
