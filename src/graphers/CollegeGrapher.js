import FieldGrapher from "graphers/FieldGrapher";

/**
 * A FieldGrapher that can draw a representation of a college football field.
 */
export default class CollegeGrapher extends FieldGrapher {
    static get FIELD_HEIGHT() { return 84; }
    static get FIELD_WIDTH() { return 160; }

    drawField() {
        let scale = this._scale;

        // field background
        this._field.append("rect")
            .attr("class", "field-background")
            .attr("width", this._svgWidth)
            .attr("height", this._svgHeight);

        // sideline box/field border
        this._field.append("rect")
            .attr("class", "field-border")
            .attr("width", scale.width)
            .attr("height", scale.height)
            .attr("x", scale.minX)
            .attr("y", scale.minY);

        if (this._options.drawYardlines === false) {
            return;
        }

        if (this._options.draw4Step) {
            this._field.selectAll("line.four-step")
                .data(_.range(40)) // 20 horizontal, 20 vertical
                .enter()
                .append("line")
                .classed("four-step", true)
                .each(function(d) {
                    let x1 = scale.minX;
                    let x2 = scale.maxX;
                    let y1 = scale.minY;
                    let y2 = scale.maxY;

                    if (d < 20) {
                        // horizontal
                        y1 = scale.yScale(d * 4 + 4);
                        y2 = y1;
                    } else {
                        // vertical
                        x1 = scale.xScale((d - 20) * 8 + 4);
                        x2 = x1;
                    }

                    d3.select(this)
                        .attr("x1", x1)
                        .attr("y1", y1)
                        .attr("x2", x2)
                        .attr("y2", y2);
                });
        }

        let yardlineSteps = _.range(8, 160, 8);

        // append the yardlines, excluding the 0 yardlines
        this._field.selectAll("line.yardline")
            .data(yardlineSteps)
            .enter()
            .append("line")
            .classed("yardline", true)
            .attr("x1", scale.xScale)
            .attr("y1", scale.minY)
            .attr("x2", scale.xScale)
            .attr("y2", scale.maxY);

        // hash marks, hashes 2 steps wide
        let hashWidth = scale.toDistance(2);
        [true, false].forEach(isBack => {
            let y = scale.yScale(isBack ? 32 : 52);
            let name = isBack ? "back-hash" : "front-hash";

            this._field.selectAll(`line.hash.${name}`)
                .data(yardlineSteps)
                .enter()
                .append("line")
                .classed(`hash ${name}`, true)
                .attr("y1", y)
                .attr("y2", y)
                .each(function(d) {
                    let offsetX = scale.xScale(d);
                    d3.select(this)
                        .attr("x1", offsetX - hashWidth / 2)
                        .attr("x2", offsetX + hashWidth / 2);
                });
        });

        if (this._options.drawYardlineNumbers) {
            let fontSize = scale.toDistance(3);
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
                        y = scale.maxY + fontSize;
                        d -= 105;
                    } else {
                        y = scale.minY - fontSize / 3;
                    }

                    let width = $.fromD3(label).getDimensions().width;
                    let x = scale.xScale(d * 8/5) - width/2;

                    label.attr("x", x).attr("y", y);
                });
        }
    }
}
