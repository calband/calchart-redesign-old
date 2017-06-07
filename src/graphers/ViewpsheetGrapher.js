import { FIELD_GRAPHERS } from "graphers/Grapher";

if (_.isUndefined(d3)) {
    console.error("D3 is not loaded!");
}

/**
 * A ViewpsheetGrapher draws a graph within an SVG, zoomed into the relevant
 * section of the field.
 */
export default class ViewpsheetGrapher {
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

    // /**
    //  * Draw the path of a single dot for a sheet onto the field.
    //  *
    //  * @param {Sheet} sheet
    //  * @param {Dot} dot
    //  * @param {boolean} containPath - If true, set the zoom and scroll to fit the path.
    //  */
    // drawPath(sheet, dot, containPath) {
    //     this._svg.selectAll(".draw-path").remove();

    //     let info = sheet.getDotInfo(dot);

    //     let minX = info.position.x;
    //     let maxX = info.position.x;
    //     let minY = info.position.y;
    //     let maxY = info.position.y;
    //     info.movements.forEach(movement => {
    //         let end = movement.getEndPosition();
    //         minX = Math.min(minX, end.x);
    //         maxX = Math.max(maxX, end.x);
    //         minY = Math.min(minY, end.y);
    //         maxY = Math.max(maxY, end.y);
    //     });

    //     // 2 step margin
    //     minX -= 2;
    //     maxX += 2;
    //     minY -= 2;
    //     maxY += 2;

    //     // width/height of field in steps
    //     let width = maxX - minX;
    //     let height = maxY - minY;

    //     let targetWidth = this._drawTarget.width();
    //     let targetHeight = this._drawTarget.height();
    //     let ratio = targetHeight / targetWidth;

    //     // keep y-bounds in view
    //     if (height > width * ratio) {
    //         let newWidth = height / ratio;
    //         minX = minX + width / 2 - newWidth / 2;
    //         maxX = maxX - width / 2 + newWidth / 2;
    //         width = newWidth;
    //     }

    //     // width is always at least 16 steps
    //     let minWidth = 16;
    //     if (width < minWidth) {
    //         minX = minX + width / 2 - minWidth / 2;
    //         maxX = maxX - width / 2 + minWidth / 2;
    //         width = minWidth;
    //     }

    //     let FieldGrapher = FIELD_GRAPHERS[sheet.getFieldType()];

    //     // width of field in pixels
    //     let fieldWidth = targetWidth / width * FieldGrapher.FIELD_WIDTH;
    //     if (containPath) {
    //         this._options.zoom = (fieldWidth + this._options.fieldPadding * 2) / targetWidth;
    //     }

    //     // draw field and position around bounds
    //     this.clearField();
    //     this.drawField(sheet.getFieldType());

    //     if (containPath) {
    //         let midX = this._scale.toDistanceX(minX + width / 2);
    //         this._drawTarget.scrollLeft(midX - targetWidth / 2);
    //         let midY = this._scale.toDistanceY(minY + height / 2);
    //         this._drawTarget.scrollTop(midY - targetHeight / 2);
    //     }

    //     // draw path
    //     let position = this._scale.toDistance(info.position);
    //     let pathDef = `M ${position.x} ${position.y}`;
    //     info.movements.forEach(movement => {
    //         if (movement instanceof MovementCommandArc) {
    //             let arcPath = movement.getPathDef(this._scale);
    //             pathDef += ` ${arcPath}`;
    //         } else {
    //             let position = this._scale.toDistance(movement.getEndPosition());
    //             pathDef += ` L ${position.x} ${position.y}`;
    //         }
    //     });

    //     let dotRadius = this.getDotRadius();

    //     this._svg.append("path")
    //         .classed("draw-path path-movements", true)
    //         .attr("d", pathDef)
    //         .style("stroke-width", dotRadius / 1.5);

    //     this._svg.append("circle")
    //         .classed("draw-path start-position", true)
    //         .attr("cx", position.x)
    //         .attr("cy", position.y)
    //         .attr("r", dotRadius * 1.25);
    // }
}
