/**
 * @file This file contains all the classes that handle mouse events
 * in the DotContext.
 */

import * as d3 from "d3";
import * as _ from "lodash";

import { NotImplementedError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { isSubclass } from "utils/JSUtils";
import { calcAngle, calcDistance, calcRotatedXPos, calcRotatedYPos, round } from "utils/MathUtils";

/**
 * The proxy class that can load any tools used to edit dots
 * in the workspace.
 */
export default class EditTools {
    /**
     * Load the tool with the given name.
     *
     * @param {string} name
     * @return {BaseTool}
     */
    static load(name) {
        let EditTool;
        switch (name) {
            case "selection":
                EditTool = SelectionTool;
                break;
            case "lasso":
                EditTool = LassoTool;
                break;
            case "line":
                EditTool = LineTool;
                break;
            case "arc":
                EditTool = ArcTool;
                break;
            case "rectangle":
                EditTool = RectangleTool;
                break;
            case "circle":
                EditTool = CircleTool;
                break;
            default:
                throw new Error(`No tool named: ${name}`);
        }

        if (isSubclass(BaseSelection, EditTool)) {
            this._lastSelectionTool = name;
        }

        if (isSubclass(BaseEdit, EditTool)) {
            $(".workspace").addClass("edit-tools-active");
        } else {
            $(".workspace").removeClass("edit-tools-active");
        }

        $(".toolbar .edit-tools li").removeClass("active");
        $(`.toolbar .${name}`).addClass("active");

        return EditTool;
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
 */
class BaseTool {
    /**
     * @param {DotContext} context
     */
    constructor(context) {
        this.context = context;
        this.controller = context.getController();
        this.grapher = context.getGrapher();
    }

    /**
     * Handle a mousedown event in the workspace. By default,
     * initializes an instance of the class and calls the
     * mousedown and _attachListeners methods.
     *
     * @param {DotContext} context
     * @param {Event} e
     */
    static handle(context, e) {
        e.preventDefault();
        e.stopPropagation();

        if (_.isUndefined(this.tool)) {
            this.tool = new this(context);
            this.tool._attachListeners();
            this.eventCount = 0;
        }

        this.eventCount++;
        this.tool.mousedown(e);
    }

    /**
     * The number of mousedown/mouseup events to handle before creating a
     * new instance in BaseTool#handle.
     *
     * @return {int}
     */
    static get eventsToHandle() {
        return 1;
    }

    /**
     * @return {int} The number of mousedown events handled so far.
     */
    get eventCount() {
        return this.constructor.eventCount;
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
     * The function to run after the mousedown event is handled. By
     * default, adds the mousemove and mouseup listeners to the document.
     */
    _attachListeners() {
        $(document).on({
            "mousedown.selection": e => {
                // case of eventsToHandle > 1
                this.constructor.handle(this.context, e);
            },
            "mousemove.selection": e => {
                this.mousemove(e);
            },
            "mouseup.selection": e => {
                this.mouseup(e);
                if (this.eventCount === this.constructor.eventsToHandle) {
                    this._unloadTool();
                }
            },
        });
    }

    /**
     * Convert the given (x,y) coordinates on the page to be relative to
     * the workspace. Can also pass in an Event object, which will have
     * its pageX and pageY values taken.
     *
     * @param {Event} [e]
     * @param {number} [pageX]
     * @param {number} [pageY]
     * @return {[x, y]}
     */
    _makeRelative(pageX, pageY) {
        if (arguments.length === 1) {
            let e = arguments[0];
            pageX = e.pageX;
            pageY = e.pageY;
        }

        let workspace = $(".workspace");
        let offset = workspace.offset();
        let x = pageX - offset.left + workspace.scrollLeft();
        let y = pageY - offset.top + workspace.scrollTop();
        return [x, y];
    }

    /**
     * Same as _makeRelative, except the returned values are constrained
     * to the grid, if applicable.
     */
    _makeRelativeSnap() {
        let [x, y] = this._makeRelative.apply(this, arguments);

        let grid = this.context.getGrid();
        if (grid !== 0) {
            let scale = this.grapher.getScale();
            let steps = scale.toStepCoordinates({x, y});
            let distance = scale.toDistanceCoordinates({
                x: round(steps.x, grid),
                y: round(steps.y, grid),
            });
            x = distance.x;
            y = distance.y;
        }

        return [x, y];
    }

    /**
     * The function to run after the mouseup event is handled. By
     * default, removes the mousemove and mouseup listeners from the
     * document and reverts to the SelectionTool.
     */
    _unloadTool() {
        $(document).off(".selection");
        this.constructor.tool = undefined;
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
        if ($(e.target).is(".dot-marker")) {
            this._dragType = "dot";
            this.mousedownDot(e);
        } else if (e.shiftKey || e.ctrlKey || e.metaKey) {
            this._dragType = "none";
            this.context.toggleDots(dot);
        } else {
            this._dragType = "select";
            this.mousedownSelect(e);
        }

        this._dragStart = e;
    }

    mousedownDot(e) {
        let dot = $(e.target).parent();

        if (!this.grapher.isSelected(dot)) {
            this.context.selectDots(dot, {
                append: false,
            });
        }

        this._scale = this.grapher.getScale();
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
        this.context.deselectDots();
        this._box = HTMLBuilder.div("selection-box", null, ".workspace");
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
        let scale = this.grapher.getScale();

        // change from beginning of move to now
        let deltaX = this._scrollOffset.left + e.pageX - this._dragStart.pageX;
        let deltaY = this._scrollOffset.top + e.pageY - this._dragStart.pageY;

        // snap overall movement to grid; dots can themselves be off
        // the grid, but they move in a consistent interval
        let grid = this.context.getGrid();
        if (grid !== 0) {
            let snap = scale.toDistance(grid);
            deltaX = round(deltaX, snap);
            deltaY = round(deltaY, snap);
        }

        let sheet = this.controller.getActiveSheet();
        this.controller.getSelection()
            .each((i, dot) => {
                let dotPosition = sheet.getPosition($(dot).data("dot"));
                let position = scale.toDistanceCoordinates(dotPosition);
                this.grapher.moveDotTo(dot, position.x + deltaX, position.y + deltaY);
            })
            .scrollIntoView({
                parent: ".workspace",
                tolerance: 10,
                callback: (deltaX, deltaY) => {
                    this._scrollOffset.left += deltaX;
                    this._scrollOffset.top += deltaY;
                },
            });

        this._moveOffset.x = deltaX;
        this._moveOffset.y = deltaY;
    }

    mousemoveSelect(e) {
        // get dimensions
        let width = Math.abs(e.pageX - this._dragStart.pageX);
        let height = Math.abs(e.pageY - this._dragStart.pageY);
        let [minX, minY] = this._makeRelative(
            Math.min(e.pageX, this._dragStart.pageX),
            Math.min(e.pageY, this._dragStart.pageY)
        );
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
                parent: ".workspace",
            });

        // select dots within the selection box
        this.context.deselectDots();
        this.grapher.getDots().each((i, dot) => {
            dot = $(dot);
            let position = dot.data("position");
            if (
                _.inRange(position.x, minX, maxX) &&
                _.inRange(position.y, minY, maxY)
            ) {
                this.context.selectDots(dot);
            }
        });
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
        let scale = this.grapher.getScale();
        let deltaX = scale.toSteps(this._moveOffset.x);
        let deltaY = scale.toSteps(this._moveOffset.y);

        if (deltaX !== 0 || deltaY !== 0) {
            this.controller.doAction("moveDots", [deltaX, deltaY]);
        }
    }

    mouseupSelect(e) {
        this._box.remove();
    }
}

/**
 * Selects dots within an arbitrary path drawn by the user.
 */
class LassoTool extends BaseSelection {
    mousedown(e) {
        this.context.deselectDots();

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
                parent: ".workspace",
            });
    }

    mouseup(e) {
        this.grapher.getDots().each((i, dot) => {
            dot = $(dot);
            let marker = dot.find(".dot-marker");
            let offset = marker.offset();
            let topElem = document.elementFromPoint(
                offset.left + marker.width() / 2,
                offset.top + marker.height() / 2,
            );
            if ($(topElem).is(this._path)) {
                this.context.selectDots(dot);
            }
        });

        this._path.remove();
    }
}

/**
 * A superclass for all tools that edit dots.
 */
class BaseEdit extends BaseTool {
    /**
     * Save the currently selected dots' positions.
     */
    _saveDotPositions() {
        let scale = this.grapher.getScale();
        let data = _.map(this.controller.getSelection(), dot => {
            let position = scale.toStepCoordinates($(dot).data("position"));
            return {
                dot: $(dot).data("dot"),
                x: position.x,
                y: position.y,
            };
        })
        this.controller.doAction("moveDotsTo", [data]);
    }

    _unloadTool() {
        super._unloadTool();
        this.context.loadTool(EditTools.lastSelectionTool);
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

        this.mousemove(e);
    }

    mousemove(e) {
        let [x, y] = this._makeRelativeSnap(e);

        this._line
            .attr("x2", x)
            .attr("y2", y);

        let deltaX = x - this._startX;
        let deltaY = y - this._startY;

        this.controller.getSelection().each((i, dot) => {
            let x = this._startX + i * deltaX;
            let y = this._startY + i * deltaY;
            this.grapher.moveDotTo(dot, x, y);
        });
    }

    mouseup(e) {
        this._saveDotPositions();
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
    constructor(context) {
        super(context);

        // true if user is about to select the end point
        this._drawEnd = false;
    }

    static get eventsToHandle() {
        return 2;
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

        // snap

        let grid = this.context.getGrid();
        if (grid !== 0) {
            let scale = this.grapher.getScale();
            this._snap = scale.toDistance(grid);
        }

        this.mousemove(e);
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
        if (!_.isUndefined(this._snap)) {
            this._radius = round(this._radius, this._snap);
        }

        // snap radius line to 45 degree angles
        let angle = calcAngle(this._startX, this._startY, x, y);
        angle = round(angle, 45);

        // helper path
        x = this._startX + calcRotatedXPos(angle) * this._radius;
        y = this._startY + calcRotatedYPos(angle) * this._radius;
        this._path.attr("d", `M ${this._startX} ${this._startY} L ${x} ${y}`);

        if (angle === 360) {
            this._startAngle = 0;
        } else {
            this._startAngle = angle;
        }

        this.controller.getSelection().each((i, dot) => {
            this.grapher.moveDotTo(dot, x, y);
        });

        this._lastAngle = angle;
    }

    mousemoveArc(e) {
        let [x, y] = this._makeRelative(e);

        // helper paths, snap radius line to 45 degree angles
        let angle = calcAngle(this._startX, this._startY, x, y);
        angle = round(angle, 45);
        if (angle === 360) {
            angle = 0;
        }

        x = this._startX + calcRotatedXPos(angle) * this._radius;
        y = this._startY + calcRotatedYPos(angle) * this._radius;

        let arc = this._getArcData(angle);
        let arcPath = `A ${this._radius} ${this._radius} 0 ${arc.largeArcFlag} ${arc.sweepFlag} ${x} ${y}`;
        this._path.attr("d", `${this._radiusPath} ${arcPath} Z`);

        let selection = this.controller.getSelection();
        let total = selection.length - 1;
        let delta = arc.length / total;
        selection.each((i, dot) => {
            // selection originally in reverse order
            let angle = delta * (total - i) + this._startAngle;
            let x = this._startX + calcRotatedXPos(angle) * this._radius;
            let y = this._startY + calcRotatedYPos(angle) * this._radius;
            this.grapher.moveDotTo(dot, x, y);
        });
    }

    mouseup(e) {
        if (this.eventCount === 1) {
            this._drawEnd = true;
            this._radiusPath = this._path.attr("d");
        } else {
            this._saveDotPositions();
            this._path.remove();
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
}

/**
 * Arrange the selected dots in a rectangle, where the user defines
 * TODO
 */
class RectangleTool extends BaseEdit {

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

        // snap

        let grid = this.context.getGrid();
        if (grid !== 0) {
            let scale = this.grapher.getScale();
            this._snap = scale.toDistance(grid);
        }

        this.mousemove(e);
    }

    mousemove(e) {
        // radius
        let [x, y] = this._makeRelative(e);
        let radius = calcDistance(this._startX, this._startY, x, y);
        if (!_.isUndefined(this._snap)) {
            radius = round(radius, this._snap);
        }

        // helper paths, snap radius line to 45 degree angles
        let angle = calcAngle(this._startX, this._startY, x, y);
        angle = round(angle, 45);
        let rx = calcRotatedXPos(angle) * radius;
        let ry = calcRotatedYPos(angle) * radius;
        this._line.attr("x2", this._startX + rx).attr("y2", this._startY + ry);
        this._circle.attr("r", radius);

        let selection = this.controller.getSelection();
        let delta = 360 / selection.length;
        selection.each((i, dot) => {
            let rx = calcRotatedXPos(delta * i) * radius;
            let ry = calcRotatedYPos(delta * i) * radius;
            this.grapher.moveDotTo(dot, this._startX + rx, this._startY + ry);
        });
    }

    mouseup(e) {
        this._saveDotPositions();
        this._line.remove();
        this._circle.remove();
    }
}
