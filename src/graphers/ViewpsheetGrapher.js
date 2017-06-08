import Coordinate from "calchart/Coordinate";
import MovementCommandArc from "calchart/movements/MovementCommandArc";
import FieldGrapher from "graphers/FieldGrapher";
import { FIELD_GRAPHERS } from "graphers/Grapher";

import { align, move } from "utils/SvgUtils";

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
        this._width = drawTarget.attr("width");
        this._height = drawTarget.attr("height");
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

        // field border
        this._drawTarget.append("rect")
            .attr("width", this._width)
            .attr("height", this._height);

        this._field = this._drawTarget.append("g");

        let fieldGrapher = new this._FieldGrapher(this._field, fieldWidth, fieldHeight, options);
        fieldGrapher.drawField();
        this._scale = fieldGrapher.getScale();

        let left = minX;
        let right = maxX;
        let top = minY;
        let bottom = maxY;
        if (this._isEast) {
            left = maxX;
            right = minX;
            top = maxY;
            bottom = minY;
        }

        let offsetX = this._scale.toDistanceX(left);
        let offsetY = this._scale.toDistanceY(top);
        move(this._field, -offsetX, -offsetY);

        // push west yardline numbers down to bottom of box
        let yardlineLabels = this._field.selectAll(".yardline-label");
        let yardlineOffset = this._scale.toDistanceY(bottom);
        move(yardlineLabels, 0, yardlineOffset);
        align(yardlineLabels, "bottom", "center");
        yardlineLabels
            .attr("letter-spacing", 3)
            .attr("font-size", this._scale.toDistance(2));
    }

    // /**
    //  * Draw the given sheet, zooming into the given dot and its neighbors.
    //  *
    //  * @param {Sheet} sheet
    //  * @param {Dot} dot
    //  */
    // drawNearby(sheet, dot) {
    //     let targetWidth = this._drawTarget.width();

    //     let FieldGrapher = FIELD_GRAPHERS[sheet.getFieldType()];

    //     // width of field (8 steps) in pixels
    //     let fieldWidth = targetWidth / 8 * FieldGrapher.FIELD_WIDTH;
    //     this._options.zoom = (fieldWidth + this._options.fieldPadding * 2) / targetWidth;

    //     this.clearField();
    //     this.draw(sheet);
    //     this._redrawDots();

    //     let info = sheet.getDotInfo(dot);
    //     let position = this._scale.toDistance(info.position);
    //     let fourStep = this._scale.toDistance(4);
    //     this._drawTarget.scrollLeft(position.x - fourStep);
    //     this._drawTarget.scrollTop(position.y - fourStep);
    // }

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
        info.movements.forEach(movement => {
            if (movement instanceof MovementCommandArc) {
                let arcPath = movement.getPathDef(this._scale);
                pathDef += ` ${arcPath}`;
            } else {
                let position = this._scale.toDistance(movement.getEndPosition());
                pathDef += ` L ${position.x} ${position.y}`;
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
    }
}
