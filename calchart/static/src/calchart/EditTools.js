/**
 * @file This file contains all the classes that handle mouse events
 * in the DotContext.
 */

import * as d3 from "d3";
import * as _ from "lodash";

import { NotImplementedError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { isSubclass } from "utils/JSUtils";
import { round } from "utils/MathUtils";

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
            case "rectangle":
                EditTool = RectangleTool;
                break;
            case "circle":
                EditTool = CircleTool;
                break;
            default:
                throw new Error(`No tool named: ${name}`);
        }

        if (isSubclass(SelectionTool, EditTool)) {
            this._lastSelectionTool = name;
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
        this.controller = context.getController();
        this.context = context;
    }

    /**
     * Handle a mousedown event in the workspace. By default,
     * initializes an instance of the class and calls the
     * mousedown and _postMousedown methods.
     *
     * @param {DotContext} context
     * @param {Event} e
     */
    static handle(context, e) {
        e.preventDefault();

        let tool = new this(context);
        tool.mousedown(e);
        tool._postMousedown();
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
    _postMousedown() {
        $(document).on({
            "mousemove.selection": e => {
                this.mousemove(e);
            },
            "mouseup.selection": e => {
                this.mouseup(e);
                this._postMouseup();
            },
        });
    }

    /**
     * The function to run after the mouseup event is handled. By
     * default, removes the mousemove and mouseup listeners from the
     * document and reverts to the SelectionTool.
     */
    _postMouseup() {
        this.context.loadTool(EditTools.lastSelectionTool);
        $(document).off(".selection");
    }

    /**
     * Convert the given (x,y) coordinates on the page to be relative to
     * the workspace.
     *
     * @param {number} pageX
     * @param {number} pageY
     * @return {[x, y]}
     */
    _makeRelative(pageX, pageY) {
        let workspace = $(".workspace");
        let offset = workspace.offset();
        let x = pageX - offset.left + workspace.scrollLeft();
        let y = pageY - offset.top + workspace.scrollTop();
        return [x, y];
    }
}

/**
 * The default edit tool that can either move dots or draw a rectangular
 * selection box that mass selects dots.
 */
class SelectionTool extends BaseTool {
    /**
     * @param {DotContext} context
     */
    constructor(context) {
        super(context);

        this.grapher = context.getGrapher();
        this.dots = this.grapher.getDots();
    }

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
        this.dots.each((i, dot) => {
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
class LassoTool extends SelectionTool {
    mousedown(e) {
        this.context.deselectDots();

        let [startX, startY] = this._makeRelative(e.pageX, e.pageY);
        let path = this.grapher.getSVG()
            .append("path")
            .classed("lasso-path", true)
            .attr("d", `M ${startX} ${startY}`);

        this._path = $(path.nodes());
    }

    mousemove(e) {
        let [x, y] = this._makeRelative(e.pageX, e.pageY);
        let pathDef = this._path.attr("d") + ` L ${x} ${y}`;

        this._path
            .attr("d", pathDef)
            .scrollIntoView({
                parent: ".workspace",
            });
    }

    mouseup(e) {
        this.dots.each((i, dot) => {
            dot = $(dot);
            let offset = dot.find(".dot-marker").offset();
            let topElem = document.elementFromPoint(offset.left, offset.top);
            if ($(topElem).is(this._path)) {
                this.context.selectDots(dot);
            }
        });

        this._path.remove();
    }
}
