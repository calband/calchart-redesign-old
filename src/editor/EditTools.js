/**
 * @file This file contains all the classes that handle mouse events
 * in the DotContext.
 */

import { NotImplementedError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import {
    calcAngle,
    calcDistance,
    calcRotatedXPos,
    calcRotatedYPos,
    getDimensions,
    round,
    roundSmall,
} from "utils/MathUtils";
import { addHandles, resizeHandles } from "utils/UIUtils";

/**
 * The proxy class that can load any tools used to edit dots
 * in the workspace.
 */
export default class EditTools {
    /**
     * Load the tool with the given name.
     *
     * @param {DotContext} context
     * @param {string} name
     * @return {BaseTool}
     */
    static load(context, name) {
        let EditTool;
        switch (name) {
            case "selection":
                EditTool = SelectionTool;
                break;
            case "lasso":
                EditTool = LassoTool;
                break;
            case "swap":
                EditTool = SwapTool;
                break;
            case "stretch":
                EditTool = StretchTool;
                break;
            case "line":
                EditTool = LineTool;
                break;
            case "arc":
                EditTool = ArcTool;
                break;
            case "block":
                EditTool = BlockTool;
                break;
            case "circle":
                EditTool = CircleTool;
                break;
            default:
                throw new Error(`No tool named: ${name}`);
        }

        let tool = new EditTool(context);

        if (tool instanceof BaseSelection) {
            this._lastSelectionTool = name;
        }

        if (tool instanceof BaseEdit) {
            context.workspace.addClass("edit-tools-active");
        } else {
            context.workspace.removeClass("edit-tools-active");
        }

        $(".toolbar .dot-group li").removeClass("active");
        $(`.toolbar .${name}`).addClass("active");

        tool.load();
        return tool;
    }

    /**
     * @return {string} The name of the last selection tool used.
     */
    static get lastSelectionTool() {
        return this._lastSelectionTool;
    }
}

/**
 * The superclass for all EditTool classes.
 *
 * Method handlers:
 * - User clicks tool in toolbar: load()
 * - User clicks down in workspace: handle(), which calls mousedown().
 *   Starts listening for mousemove and mouseup events
 * - User moves mouse (dragging): mousemove()
 * - User clicks up: mouseup()
 * - If isDone() returns true, stop listening for mousemove and
 *   mouseup events
 * - User clicks another tool in toolbar: unload()
 */
class BaseTool {
    /**
     * @param {DotContext} context
     */
    constructor(context) {
        this._context = context;

        // {?number} the snap grid, in distance. null if no snap grid.
        this._snap = null;
    }

    get context() {
        return this._context;
    }

    get controller() {
        return this.context.controller;
    }

    get grapher() {
        return this.context.grapher;
    }

    get scale() {
        return this.grapher.getScale();
    }

    /**
     * Runs any actions when the tool is loaded from the toolbar.
     */
    load() {}

    /**
     * Runs any actions whenever the grapher zoom changes.
     */
    refreshZoom() {}

    /**
     * Runs any actions when the tool is unloaded from the toolbar.
     */
    unload() {}

    /**
     * @return {boolean} true if mousemove/mouseup events should
     *   stop being listened for.
     */
    isDone() {
        return true;
    }

    /**
     * The function to run before mousedown is triggered.
     *
     * @param {Event} e
     */
    handle(e) {
        let grid = this.context.getGrid();
        if (grid) {
            this._snap = this.scale.toDistance(grid);
        } else {
            this._snap = null;
        }

        this.mousedown(e);
    }

    /**
     * The function to run when the mousedown event is triggered
     * in the workspace.
     *
     * @param {Event} e
     */
    mousedown(e) {}

    /**
     * The function to run when the mousemove event is triggered
     * in the workspace.
     *
     * @param {Event} e
     */
    mousemove(e) {}

    /**
     * The function to run when the mouseup event is triggered
     * in the workspace.
     *
     * @param {Event} e
     */
    mouseup(e) {}

    /**
     * Convert the given (x,y) coordinates on the page to be relative to
     * the workspace. Can also pass in an Event object, which will have
     * its pageX and pageY values taken.
     *
     * Usage:
     * let [x, y] = this._makeRelative(e);
     * let [x, y] = this._makeRelative(pageX, pageY);
     *
     * @param {Event} [e]
     * @param {number} [pageX]
     * @param {number} [pageY]
     * @return {number[]} The coordinates as [x, y].
     */
    _makeRelative(pageX, pageY) {
        if (arguments.length === 1) {
            let e = arguments[0];
            pageX = e.pageX;
            pageY = e.pageY;
        }

        return this.context.workspace.makeRelative(pageX, pageY);
    }

    /**
     * Same as _makeRelative, except the returned values are snapped
     * to the grid, if applicable.
     */
    _makeRelativeSnap() {
        let [x, y] = this._makeRelative.apply(this, arguments);

        let grid = this.context.getGrid();
        if (grid) {
            let roundX = round(this.scale.toStepsX(x), grid);
            let roundY = round(this.scale.toStepsY(y), grid);
            x = this.scale.toDistanceX(roundX);
            y = this.scale.toDistanceY(roundY);
        }

        return [x, y];
    }
}

/**
 * A superclass for all tools that select dots
 */
class BaseSelection extends BaseTool {
}

/**
 * The default edit tool that can either move dots or draw a rectangular
 * selection box that mass selects dots.
 */
class SelectionTool extends BaseSelection {
    mousedown(e) {
        this._metaKey = e.shiftKey || e.ctrlKey || e.metaKey;

        if ($(e.target).is(".dot-marker")) {
            if (this._metaKey) {
                this.mousedownToggle(e);
            } else {
                this.mousedownDot(e);
            }
        } else {
            this.mousedownSelect(e);
        }

        this._dragStart = e;
    }

    mousedownToggle(e) {
        this._dragType = "none";

        let dot = $(e.target).parent();
        this.context.toggleDots(dot);
    }

    mousedownDot(e) {
        this._dragType = "dot";

        let dot = $(e.target).parent();
        if (!this.grapher.isSelected(dot)) {
            this.context.selectDots(dot);
        }

        this._scrollOffset = {
            top: 0,
            left: 0,
        };
        this._moveOffset = {
            x: 0,
            y: 0,
        };
    }

    mousedownSelect(e) {
        this._dragType = "select";

        if (this._metaKey) {
            let selectedDots = this.context.getSelectedDots().map(dot => dot.id);
            this._selected = new Set(selectedDots);
        } else {
            this.context.deselectDots();
        }

        this._box = HTMLBuilder.div("selection-box").appendTo(this.context.workspace);
        this._scrollOffset = {
            top: 0,
            left: 0,
        };
    }

    mousemove(e) {
        switch (this._dragType) {
            case "dot":
                this.mousemoveDot(e);
                break;
            case "select":
                this.mousemoveSelect(e);
                break;
        }
    }

    mousemoveDot(e) {
        // change from beginning of move to now
        let deltaX = this._scrollOffset.left + e.pageX - this._dragStart.pageX;
        let deltaY = this._scrollOffset.top + e.pageY - this._dragStart.pageY;

        // snap overall movement to grid; dots can themselves be off
        // the grid, but they move in a consistent interval
        if (this._snap) {
            deltaX = round(deltaX, this._snap);
            deltaY = round(deltaY, this._snap);
        }

        this.context.getSelection()
            .each((i, dot) => {
                let dotPosition = this.context.activeSheet.getPosition($(dot).data("dot"));
                let position = this.scale.toDistance(dotPosition);
                this.grapher.moveDotTo(dot, position.x + deltaX, position.y + deltaY);
            })
            .scrollIntoView({
                parent: this.context.workspace,
                tolerance: 10,
                callback: (dx, dy) => {
                    this._scrollOffset.left += dx;
                    this._scrollOffset.top += dy;
                },
            });

        this._moveOffset.x = deltaX;
        this._moveOffset.y = deltaY;
    }

    mousemoveSelect(e) {
        let {x, y, width, height} = getDimensions(
            e.pageX,
            e.pageY,
            this._dragStart.pageX - this._scrollOffset.left,
            this._dragStart.pageY - this._scrollOffset.top
        );
        let [minX, minY] = this._makeRelative(x, y);
        let maxX = minX + width;
        let maxY = minY + height;

        // update dimensions of the selection box
        this._box
            .css({
                top: minY,
                left: minX,
                width: width,
                height: height,
            })
            .scrollIntoView({
                parent: this.context.workspace,
                callback: (dx, dy) => {
                    this._scrollOffset.left += dx;
                    this._scrollOffset.top += dy;
                },
            });

        // dont refresh until the end
        let options = {
            append: true,
            refresh: false,
        };

        this.context.deselectDots(undefined, options);

        // select dots within the selection box
        this.grapher.getDots().each((i, dot) => {
            let id = $(dot).data("dot").id;
            let position = $(dot).data("position");
            let inRange = (
                _.inRange(position.x, minX, maxX) &&
                _.inRange(position.y, minY, maxY)
            );

            // TODO: fix (#152)
            if (inRange) {
                if (this._metaKey && this._selected.has(id)) {
                    this.context.deselectDots(dot, options);
                } else {
                    this.context.selectDots(dot, options);
                }
            } else if (this._metaKey) {
                if (this._selected.has(id)) {
                    this.context.selectDots(dot, options);
                } else {
                    this.context.deselectDots(dot, options);
                }
            }
        });

        this.context.refresh("panel");
    }

    mouseup(e) {
        switch (this._dragType) {
            case "dot":
                this.mouseupDot(e);
                break;
            case "select":
                this.mouseupSelect(e);
                break;
        }
    }

    mouseupDot(e) {
        if (this._moveOffset.x !== 0 || this._moveOffset.y !== 0) {
            let deltaX = this.scale.toSteps(this._moveOffset.x);
            let deltaY = this.scale.toSteps(this._moveOffset.y);
            this.controller.doAction("moveDots", [deltaX, deltaY]);
        }
    }

    mouseupSelect(e) {
        this._box.remove();
    }
}

/**
 * Select dots within an arbitrary path drawn by the user.
 */
class LassoTool extends BaseSelection {
    mousedown(e) {
        let [startX, startY] = this._makeRelative(e);
        let path = this.grapher.getSVG()
            .append("path")
            .classed("edit-tool-path lasso-path", true)
            .attr("d", `M ${startX} ${startY}`);

        this._path = $.fromD3(path);
    }

    mousemove(e) {
        let [x, y] = this._makeRelative(e);
        let pathDef = this._path.attr("d") + ` L ${x} ${y}`;

        this._path
            .attr("d", pathDef)
            .scrollIntoView({
                parent: this.context.workspace,
            });

        this.context.deselectDots();

        this.grapher.getDots().each((i, dot) => {
            let marker = $(dot).find(".dot-marker");
            let offset = marker.offset();
            let dimensions = marker.getDimensions();
            let topElem = document.elementFromPoint(
                offset.left + dimensions.width / 2,
                offset.top + dimensions.height / 2
            );
            if ($(topElem).is(this._path)) {
                this.context.selectDots(dot, {
                    append: true,
                    refresh: false,
                });
            }
        });

        this.context.refresh("panel");
    }

    mouseup(e) {
        this._path.remove();
    }
}

/**
 * Swap two dots' positions
 */
class SwapTool extends BaseTool {
    load() {
        // if multiple dots are selected, just deselect everything
        if (this.context.getSelection().length > 1) {
            this.context.deselectDots();
        }
    }

    mousedown(e) {
        if ($(e.target).is(".dot-marker")) {
            let selection = this.context.getSelection();
            let dot = $(e.target).parent();

            if (selection.length === 0) {
                this.context.selectDots(dot);
            } else {
                let dot1 = selection.data("dot");
                let dot2 = dot.data("dot");
                this.controller.doAction("swapDots", [dot1, dot2]);
                this.context.deselectDots();
            }
        } else {
            this.context.deselectDots();
        }
    }
}

/**
 * A superclass for all tools that edit dots.
 */
class BaseEdit extends BaseTool {
    handle(e) {
        // By default, always run mousemove after mousedown.
        super.handle(e);
        this.mousemove(e);
    }

    mouseup(e) {
        this._saveDotPositions();
        this.context.loadTool(EditTools.lastSelectionTool);
    }

    /**
     * Save the currently selected dots' positions.
     */
    _saveDotPositions() {
        let data = _.map(this.context.getSelection(), dot => {
            let position = this.scale.toSteps($(dot).data("position"));
            return {
                dot: $(dot).data("dot"),
                x: roundSmall(position.x),
                y: roundSmall(position.y),
            };
        })
        this.controller.doAction("moveDotsTo", [data]);
    }
}

/**
 * Stretch and rotate the selected dots.
 */
class StretchTool extends BaseEdit {
    load() {
        this._box = HTMLBuilder.div("stretch-box").appendTo(this.context.workspace);
        addHandles(this._box);

        let bounds = this._getDotBounds();
        bounds.height = bounds.bottom - bounds.top;
        bounds.width = bounds.right - bounds.left;

        // dot ID to ratio of position to top/left-most dot
        this._positions = {};
        this.context.getSelection().each((i, $dot) => {
            let dot = $($dot).data("dot");
            let position = $($dot).data("position");

            this._positions[dot.id] = {
                top: (position.y - bounds.top) / bounds.height,
                left: (position.x - bounds.left) / bounds.width,
            };
        });

        this.refreshZoom();
    }

    refreshZoom() {
        super.refreshZoom();

        if (this._box) {
            let bounds = this._getDotBounds();
            this._margin = this.grapher.getDotRadius() + 5;

            this._box.css({
                top: bounds.top - this._margin,
                left: bounds.left - this._margin,
                height: (bounds.bottom - bounds.top) + 2 * this._margin,
                width: (bounds.right - bounds.left) + 2 * this._margin,
            });
        }
    }

    unload() {
        this._box.remove();
    }

    mousedown(e) {
        // TODO: rotate (#129)

        if (!$(e.target).is(".handle")) {
            this._handle = null;
            return;
        }

        this._handle = $(e.target).data("handle-id");
        let offset = this._box.offset();
        let [x, y] = this._makeRelative(offset.left, offset.top);
        this._start = {
            top: y,
            left: x,
            width: this._box.outerWidth(),
            height: this._box.outerHeight(),
        };
    }

    mousemove(e) {
        if (_.isNull(this._handle)) {
            return;
        }

        let data = resizeHandles(this._handle, this._start, e);
        this._box.css(data);

        let left = data.left + this._margin;
        let top = data.top + this._margin;
        let width = data.width - 2 * this._margin;
        let height = data.height - 2 * this._margin;

        this.context.getSelection().each((i, dot) => {
            let id = $(dot).data("dot").id;
            let ratio = this._positions[id];
            let x = ratio.left * width + left;
            let y = ratio.top * height + top;
            this.grapher.moveDotTo(dot, x, y);
        });
    }

    mouseup(e) {
        // don't load selection tool
        this._saveDotPositions();
    }

    /**
     * @return {object} The bounds for the dots. bounds.left is equivalent to
     *   the x-coordinate of the left-most dot.
     */
    _getDotBounds() {
        let bounds = this.context.getSelection().getBounds();

        let workspace = this.context.workspace;
        let scrollLeft = workspace.scrollLeft();
        let scrollTop = workspace.scrollTop();
        let offset = workspace.offset();

        // make bounds relative to center of dots instead of edge of dot
        let dotRadius = this.grapher.getDotRadius();
        bounds.left += scrollLeft + dotRadius - offset.left;
        bounds.top += scrollTop + dotRadius - offset.top;
        bounds.right += scrollLeft - dotRadius - offset.left;
        bounds.bottom += scrollTop - dotRadius - offset.top;

        return bounds;
    }
}

/**
 * Arrange the selected dots in a line, where the user defines the
 * interval and angle at which to draw the line.
 */
class LineTool extends BaseEdit {
    mousedown(e) {
        let [startX, startY] = this._makeRelativeSnap(e);
        this._startX = startX;
        this._startY = startY;

        // the helper line
        let line = this.grapher.getSVG()
            .append("line")
            .classed("edit-tool-path", true)
            .attr("x1", this._startX)
            .attr("y1", this._startY);
        this._line = $.fromD3(line);
    }

    mousemove(e) {
        let [x, y] = this._makeRelativeSnap(e);

        this._line.attr("x2", x).attr("y2", y);

        let deltaX = x - this._startX;
        let deltaY = y - this._startY;

        // TODO: Fix order (#132)
        this.context.getSelection().get().reverse().forEach((dot, i) => {
            let x = this._startX + i * deltaX;
            let y = this._startY + i * deltaY;
            this.grapher.moveDotTo(dot, x, y);
        });
    }

    mouseup(e) {
        super.mouseup(e);
        this._line.remove();
    }
}

/**
 * Arrange the selected dots in an arc, where the user defines the
 * origin of the circle and the start/end of the arc. The tool is
 * used with two mouse events: click and drag from the origin to the
 * start position, and then click again for the end position.
 */
class ArcTool extends BaseEdit {
    load() {
        // true if user is about to select the end point
        this._drawEnd = false;
    }

    isDone() {
        this._drawEnd = !this._drawEnd;
        return !this._drawEnd;
    }

    mousedown(e) {
        if (this._drawEnd) {
            return;
        }

        let [startX, startY] = this._makeRelativeSnap(e);
        this._startX = startX;
        this._startY = startY;

        // after clicking and dragging for the first time, will contain the
        // path definition for the helper line going from origin to start.
        this._radiusPath = "";
        this._radius = 0;

        // angle of the start point
        this._startAngle = 0;
        // angle of the last point seen (when drawing arc)
        this._lastAngle = 0;

        // helper path

        let path = this.grapher.getSVG()
            .append("path")
            .classed("edit-tool-path", true);
        this._path = $.fromD3(path);
    }

    mousemove(e) {
        if (this._drawEnd) {
            this.mousemoveArc(e);
        } else {
            this.mousemoveRadius(e);
        }
    }

    mousemoveRadius(e) {
        // radius
        let [x, y] = this._makeRelative(e);
        this._radius = calcDistance(this._startX, this._startY, x, y);
        if (this._snap) {
            this._radius = round(this._radius, this._snap);
        }

        let angle = this._snapAngle(this._startX, this._startY, x, y);

        // helper path
        x = this._startX + calcRotatedXPos(angle) * this._radius;
        y = this._startY + calcRotatedYPos(angle) * this._radius;
        this._path.attr("d", `M ${this._startX} ${this._startY} L ${x} ${y}`);

        this._startAngle = angle;

        this.context.getSelection().each((i, dot) => {
            this.grapher.moveDotTo(dot, x, y);
        });

        this._lastAngle = angle;
    }

    mousemoveArc(e) {
        let [x, y] = this._makeRelative(e);
        let angle = this._snapAngle(this._startX, this._startY, x, y);

        x = this._startX + calcRotatedXPos(angle) * this._radius;
        y = this._startY + calcRotatedYPos(angle) * this._radius;

        let arc = this._getArcData(angle);
        let arcPath = `A ${this._radius} ${this._radius} 0 ${arc.largeArcFlag} ${arc.sweepFlag} ${x} ${y}`;
        this._path.attr("d", `${this._radiusPath} ${arcPath} Z`);

        let selection = this._context.getSelection();
        let total = selection.length - 1;
        let delta = arc.length / total;
        // TODO: Fix order (#132)
        selection.get().reverse().forEach((dot, i) => {
            let angle = delta * i + this._startAngle;
            let x = this._startX + calcRotatedXPos(angle) * this._radius;
            let y = this._startY + calcRotatedYPos(angle) * this._radius;
            this.grapher.moveDotTo(dot, x, y);
        });
    }

    mouseup(e) {
        if (this._drawEnd) {
            super.mouseup(e);
            this._path.remove();
        } else {
            this._radiusPath = this._path.attr("d");
        }
    }

    /**
     * Get the data for the arc path, where the arc goes from this._startAngle to the given angle.
     * Documentation: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Arcs
     *
     * @param {int} angle - The angle to end at, in Calchart degrees.
     * @return {Object} An object with the keys `length`, `largeArcFlag`, and `sweepFlag`.
     */
    _getArcData(angle) {
        let diff = Math.abs(angle - this._lastAngle);

        if (diff === 180) {
            // 180deg continues in same CW/CCW direction
            if (this._lastAngle < this._startAngle) {
                this._lastAngle -= 180;
            } else {
                this._lastAngle += 180;
            }
        } else {
            // find closest angle among equivalent angles
            this._lastAngle = _.minBy(
                [angle, angle - 360, angle + 360],
                angle => Math.abs(angle - this._lastAngle) - diff
            );
        }

        let length = this._lastAngle - this._startAngle;

        while (length <= -360) {
            this._lastAngle += 360;
            length += 360;
        }
        while (length >= 360) {
            this._lastAngle -= 360;
            length -= 360;
        }

        return {
            // positive if CW, negative if CCW
            length: length,
            // <180: 0, >180: 1
            largeArcFlag: Math.abs(length) < 180 ? 0 : 1,
            // CCW: 0, CW: 1
            sweepFlag: length < 0 ? 0 : 1,
        };
    }

    /**
     * Calculate the angle between the given points and snap to
     * 45 degree intervals;
     *
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @return {number}
     */
    _snapAngle(x1, y1, x2, y2) {
        let angle = calcAngle(x1, y1, x2, y2);
        angle = round(angle, 45);
        return angle === 360 ? 0 : angle;
    }
}

/**
 * Arrange the selected dots in a block, where the user defines
 * the top-left corner and either the number of rows or the number
 * of columns as dragged, snapping to the grid.
 *
 * If the grid is not set, the user can drag a box shape and the block
 * will fill in.
 */
class BlockTool extends BaseEdit {
    mousedown(e) {
        let [startX, startY] = this._makeRelativeSnap(e);
        this._startX = startX;
        this._startY = startY;

        // helper path
        let line = this.grapher.getSVG()
            .append("line")
            .classed("edit-tool-path", true)
            .attr("x1", this._startX)
            .attr("y1", this._startY);
        this._line = $.fromD3(line);

        // always make sure there's a grid; default to 2
        if (_.isNull(this._snap)) {
            this._snap = this.scale.toDistance(2);
        }
    }

    mousemove(e) {
        let [endX, endY] = this._makeRelativeSnap(e);
        let selection = this.context.getSelection();

        let deltaX = endX - this._startX;
        let deltaY = endY - this._startY;

        if (deltaX < 0 && deltaY < 0) {
            return;
        }

        let numCols;
        if (deltaX > deltaY) {
            endY = this._line.attr("y1");
            // include last column
            numCols = deltaX / this._snap + 1;
        } else {
            endX = this._line.attr("x1");
            // include last row
            let numRows = deltaY / this._snap + 1;
            numCols = Math.ceil(selection.length / numRows);
        }

        this._line.attr("x2", endX).attr("y2", endY);

        // move dots
        // TODO: Fix order (#132)
        selection.get().reverse().forEach((dot, i) => {
            let dotX = this._startX + (i % numCols) * this._snap;
            let dotY = this._startY + Math.floor(i / numCols) * this._snap;
            this.grapher.moveDotTo(dot, dotX, dotY);
        });
    }

    mouseup(e) {
        super.mouseup(e);
        this._line.remove();
    }
}

/**
 * Arrange the selected dots in a circle, where the user defines
 * the origin and radius of the circle.
 */
class CircleTool extends BaseEdit {
    mousedown(e) {
        let [startX, startY] = this._makeRelativeSnap(e);
        this._startX = startX;
        this._startY = startY;

        // helper paths

        let svg = this.grapher.getSVG();

        let line = svg.append("line")
            .classed("edit-tool-path", true)
            .attr("x1", this._startX)
            .attr("y1", this._startY);
        this._line = $.fromD3(line);

        let circle = svg.append("circle")
            .classed("edit-tool-path", true)
            .attr("cx", this._startX)
            .attr("cy", this._startY);
        this._circle = $.fromD3(circle);
    }

    mousemove(e) {
        // radius
        let [x, y] = this._makeRelative(e);
        let radius = calcDistance(this._startX, this._startY, x, y);
        if (this._snap) {
            radius = round(radius, this._snap);
        }

        // helper paths, snap radius line to 45 degree angles
        let angle = calcAngle(this._startX, this._startY, x, y);
        angle = round(angle, 45);
        let rx = calcRotatedXPos(angle) * radius;
        let ry = calcRotatedYPos(angle) * radius;
        this._line.attr("x2", this._startX + rx).attr("y2", this._startY + ry);
        this._circle.attr("r", radius);

        let selection = this.context.getSelection();
        let delta = 360 / selection.length;
        selection.each((i, dot) => {
            let rx = calcRotatedXPos(delta * i) * radius;
            let ry = calcRotatedYPos(delta * i) * radius;
            this.grapher.moveDotTo(dot, this._startX + rx, this._startY + ry);
        });
    }

    mouseup(e) {
        super.mouseup(e);
        this._line.remove();
        this._circle.remove();
    }
}
