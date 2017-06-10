import MovementCommandArc from "calchart/movements/MovementCommandArc";
import { FIELD_GRAPHERS } from "graphers/Grapher";

import { getYCoordinateText } from "utils/CalchartUtils";
import { align, drawDot, move } from "utils/SVGUtils";

if (_.isUndefined(d3)) {
    console.error("D3 is not loaded!");
}

/**
 * A ViewpsheetGrapher draws a graph within an SVG for generating viewpsheets.
 */
export default class ViewpsheetGrapher {
    /**
     * @param {D3} drawTarget - The <g> element to draw the graph within.
     * @param {Sheet} sheet - The sheet being generated in the viewpsheet
     * @param {Dot} dot - The dot whose viewpsheet is being generated
     * @param {boolean} isEast - if true, draw the graph with the east
     *   sideline facing up.
     */
    constructor(drawTarget, sheet, dot, isEast) {
        this._drawTarget = drawTarget;
        this._width = parseFloat(drawTarget.attr("width"));
        this._height = parseFloat(drawTarget.attr("height"));
        this._sheet = sheet;
        this._dot = dot;
        this._isEast = isEast;

        let fieldType = this._sheet.getFieldType();
        this._FieldGrapher = FIELD_GRAPHERS[fieldType];
        this._fieldWidth = this._FieldGrapher.FIELD_WIDTH;
        this._fieldHeight = this._FieldGrapher.FIELD_HEIGHT;

        this._field = null;
        this._scale = null;
    }

    /**
     * Draw the field, zoomed into the given bounds, provided in steps.
     *
     * @param {number} minX
     * @param {number} maxX
     * @param {number} minY
     * @param {number} maxY
     * @param {object} options - See Grapher.setOption for descriptions of
     *   the possible options. Possible options:
     *     - {boolean} [draw4Step=false]
     *     - {boolean} [drawYardlineNumbers=false]
     *     - {boolean} [drawYardlines=true]
     */
    drawField(minX, maxX, minY, maxY, options) {
        options = _.defaults({}, options, {
            draw4Step: false,
            drawYardlineNumbers: false,
            drawYardlines: true,
            eastUp: this._isEast,
            fieldPadding: 0,
        });

        // width/height of field in steps
        let width = maxX - minX;
        let height = maxY - minY;
        let ratio = this._height / this._width;

        // calculated width/height based on the other value,
        // keeping the same ratio
        let newWidth = height / ratio;
        let newHeight = width * ratio;

        // keep y-bounds in view
        if (height > newHeight) {
            minX = minX + width / 2 - newWidth / 2;
            maxX = maxX - width / 2 + newWidth / 2;
            width = newWidth;
        } else {
            minY = minY + height / 2 - newHeight / 2;
            maxY = maxY - height / 2 + newHeight / 2;
            height = newHeight;
        }

        // width of field in pixels
        let fieldWidth = this._width * this._fieldWidth / width;
        let fieldHeight = this._height * this._fieldHeight / height;

        this._field = this._drawTarget.append("g");

        let fieldGrapher = new this._FieldGrapher(this._field, fieldWidth, fieldHeight, options);
        fieldGrapher.drawField();
        this._field.select(".field-background").remove();
        this._scale = fieldGrapher.getScale();

        // convert to distance
        minX = this._scale.toDistanceX(minX);
        maxX = this._scale.toDistanceX(maxX);
        minY = this._scale.toDistanceY(minY);
        maxY = this._scale.toDistanceY(maxY);

        // remember the bounds of the viewport
        if (this._isEast) {
            this._bounds = {
                left: maxX,
                right: minX,
                top: maxY,
                bottom: minY,
            };
        } else {
            this._bounds = {
                left: minX,
                right: maxX,
                top: minY,
                bottom: maxY,
            };
        }

        move(this._field, -this._bounds.left, -this._bounds.top);

        // push west yardline numbers down to bottom of box
        let yardlineLabels = this._field.selectAll(".yardline-label");
        move(yardlineLabels, 0, this._bounds.bottom);
        align(yardlineLabels, "bottom", "center");
        yardlineLabels
            .attr("letter-spacing", 3)
            .attr("font-size", this._scale.toDistance(2));
    }

    /**** VIEWPSHEET METHODS ****/

    /**
     * Draw the birds eye view of the sheet, highlighting the current dot.
     */
    drawBirdsEye() {
        this.drawField(0, this._fieldWidth, 0, this._fieldHeight, {
            drawYardlines: false,
        });

        // draw some guide lines
        let fifty = this._scale.toDistanceX(50 * 8/5);
        this._field.append("line")
            .classed("birds-eye-guides", true)
            .attr("x1", fifty)
            .attr("y1", this._scale.minY)
            .attr("x2", fifty)
            .attr("y2", this._scale.maxY);
        let eastHash = this._scale.toDistanceY(32);
        this._field.append("line")
            .classed("birds-eye-guides", true)
            .attr("x1", this._scale.minX)
            .attr("y1", eastHash)
            .attr("x2", this._scale.maxX)
            .attr("y2", eastHash);
        let westHash = this._scale.toDistanceY(52);
        this._field.append("line")
            .classed("birds-eye-guides", true)
            .attr("x1", this._scale.minX)
            .attr("y1", westHash)
            .attr("x2", this._scale.maxX)
            .attr("y2", westHash);

        let dotRadius = this._scale.toDistance(1);
        this._sheet.show.getDots().forEach(dot => {
            let info = this._sheet.getDotInfo(dot);
            let position = this._scale.toDistance(info.position);

            this._field.append("circle")
                .classed("birds-eye-dot", true)
                .classed("curr-dot", dot === this._dot)
                .attr("cx", position.x)
                .attr("cy", position.y)
                .attr("r", dotRadius);
        });
    }

    /**
     * Draw the dot and its neighbors in the sheet.
     */
    drawNearby() {
        let info = this._sheet.getDotInfo(this._dot);
        let width = 32;
        let minX = info.position.x - width/2;
        let maxX = info.position.x + width/2;
        let minY = info.position.y;
        let maxY = info.position.y;
        this.drawField(minX, maxX, minY, maxY, {
            draw4Step: true,
            drawYardlineNumbers: true,
        });

        let dots = this._field.append("g");
        let labels = this._field.append("g");
        let dotRadius = this._scale.toDistance(0.5);

        this._sheet.show.getDots().forEach(dot => {
            let info = this._sheet.getDotInfo(dot);
            let position = this._scale.toDistance(info.position);

            let $dot = dots.append("g");
            move($dot, position);
            drawDot($dot, dotRadius, info.type);

            let label = labels.append("text")
                .classed("dot-label", true)
                .attr("font-size", dotRadius * 2)
                .attr("dx", -dotRadius/3)
                .attr("dy", -3)
                .text(dot.label);
            move(label, position);
            align(label, "bottom", "right");
            if (dot === this._dot) {
                label.classed("curr-label", true);
            }
        });
    }

    /**
     * Draw the movements of the dot in the sheet.
     */
    drawPath() {
        let info = this._sheet.getDotInfo(this._dot);

        // find bounds of movements
        let minX = info.position.x;
        let maxX = info.position.x;
        let minY = info.position.y;
        let maxY = info.position.y;
        info.movements.forEach(movement => {
            let end = movement.getEndPosition();
            minX = Math.min(minX, end.x);
            maxX = Math.max(maxX, end.x);
            minY = Math.min(minY, end.y);
            maxY = Math.max(maxY, end.y);
        });

        // 2 step padding between movements and the edge of the graph
        minX -= 2;
        maxX += 2;
        minY -= 2;
        maxY += 2;

        // width should always be at least 16 steps wide
        let width = maxX - minX;
        if (width < 16) {
            minX = minX + width/2 - 8;
            maxX = maxX - width/2 + 8;
        }

        this.drawField(minX, maxX, minY, maxY, {
            draw4Step: true,
            drawYardlineNumbers: true,
        });

        // draw path
        let position = this._scale.toDistance(info.position);
        let pathDef = `M ${position.x} ${position.y}`;

        let lastPosition = position;
        info.movements.forEach(movement => {
            if (movement instanceof MovementCommandArc) {
                let arcPath = movement.getPathDef(this._scale);
                pathDef += ` ${arcPath}`;
            } else {
                lastPosition = this._scale.toDistance(movement.getEndPosition());
                pathDef += ` L ${lastPosition.x} ${lastPosition.y}`;
            }
        });

        let dotRadius = this._scale.toDistance(0.75);
        this._field.append("path")
            .classed("path-movements", true)
            .attr("d", pathDef)
            .attr("stroke-width", dotRadius / 2);
        this._field.append("circle")
            .classed("start-position", true)
            .attr("cx", position.x)
            .attr("cy", position.y)
            .attr("r", dotRadius);

        // check if dot is on the left side of the viewport
        let dotOnLeft = position.x <= this._bounds.left + this._width / 2;

        // add y-position info
        let positionInfo = this._field.append("text")
            .classed("position-info", true)
            .text(getYCoordinateText(info.position.y))
            .attr("y", position.y);
        if (dotOnLeft) {
            positionInfo.attr("x", this._bounds.right - 3);
            align(positionInfo, "bottom", "right");
        } else {
            positionInfo.attr("x", this._bounds.left + 3);
            align(positionInfo, "bottom", "left");
        }
    }
}
