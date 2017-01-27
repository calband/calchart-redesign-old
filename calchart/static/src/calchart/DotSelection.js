/**
 * @file This file contains all the classes that customize the selection method
 * in the DotContext.
 */

import * as d3 from "d3";
import * as _ from "lodash";

import { NotImplementedError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";

// remember the currently active selection method
let SelectionClass = undefined;

/**
 * The helper class that remembers the currently loaded selection
 * method and can start selecting dots accordingly.
 */
export default class DotSelection {
    /**
     * Load the selection with the given name.
     *
     * @param {string} name
     */
    static load(name) {
        switch (name) {
            case "box":
                SelectionClass = BoxSelection;
                break;
            case "lasso":
                SelectionClass = LassoSelection;
                break;
            default:
                throw new Error(`No selection named: ${name}`);
        }
    }

    /**
     * @return {string} The name of the icon in the toolbar for the
     *   currently loaded selection method.
     */
    static get iconName() {
        return SelectionClass.icon;
    }

    /**
     * Start selecting dots.
     *
     * @param {DotContext} context
     */
    static start(context, e) {
        let selection = new SelectionClass(context);
        selection.mousedown(e);

        $(document).on({
            "mousemove.selection": e => {
                selection.mousemove(e);
            },
            "mouseup.selection": e => {
                selection.mouseup(e);
                $(document).off(".selection");
            },
        });
    }
}

/**
 * The abstract superclass for all custom selection classes.
 */
class BaseSelection {
    /**
     * Initialize the selection class with helper variables and adds listeners
     * for the mousemove and mouseup events.
     *
     * @param {DotContext} context
     */
    constructor(context) {
        this.context = context;
        this.grapher = context.getGrapher();
        this.dots = this.grapher.getDots();

        this.scroll = {
            top: $(".workspace").scrollTop(),
            left: $(".workspace").scrollLeft(),
        };
    }

    /**
     * @return {string} The name of the selection icon in the toolbar.
     */
    static get icon() {
        throw new NotImplementedError(this);
    }

    /**
     * The function that is called when the user puts their mouse down on the field.
     *
     * @param {Event} e
     */
    mousedown(e) {}

    /**
     * The function that is called when the user moves the mouse.
     *
     * @param {Event} e
     */
    mousemove(e) {}

    /**
     * The function that is called when the user lifts their mouse.
     *
     * @param {Event} e
     */
    mouseup(e) {}

    /**
     * Scroll the given element into view.
     *
     * @param {jQuery} element
     */
    _scrollIntoView(element) {
        $(element).scrollIntoView({
            parent: ".workspace",
            callback: (deltaX, deltaY) => {
                this.scroll.top += deltaY;
                this.scroll.left += deltaX;
            },
        });
    }
}

/**
 * Selects a rectangular area of dots.
 */
class BoxSelection extends BaseSelection {
    static get icon() {
        return "selection";
    }

    mousedown(e) {
        this.start = e;
        HTMLBuilder.div("selection-box", null, $(".workspace"));
    }

    mousemove(e) {
        let width = Math.abs(e.pageX - this.start.pageX);
        let height = Math.abs(e.pageY - this.start.pageY);

        // relative to workspace
        let offset = $(".workspace").offset();
        let minX = Math.min(e.pageX, this.start.pageX) - offset.left + this.scroll.left;
        let minY = Math.min(e.pageY, this.start.pageY) - offset.top + this.scroll.top;
        let maxX = minX + width;
        let maxY = minY + height;

        // update dimensions of the selection box
        $(".selection-box").css({
            top: minY,
            left: minX,
            width: width,
            height: height,
        });
        this._scrollIntoView(".selection-box");

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
        $(".selection-box").remove();
    }
}

/**
 * Selects dots within an arbitrary path drawn by the user.
 */
class LassoSelection extends BaseSelection {
    static get icon() {
        return "lasso";
    }

    mousedown(e) {
        let [startX, startY] = this._makeRelative(e);
        let path = this.grapher.getSVG()
            .append("path")
            .classed("lasso-path", true)
            .attr("d", `M ${startX} ${startY}`);

        this.path = $(path.nodes());
    }

    mousemove(e) {
        let [x, y] = this._makeRelative(e);
        let pathDef = this.path.attr("d") + ` L ${x} ${y}`;

        this.path.attr("d", pathDef);
        this._scrollIntoView(this.path);
    }

    mouseup(e) {
        this.dots.each((i, dot) => {
            dot = $(dot);
            let offset = dot.find(".dot-marker").offset();
            let topElem = document.elementFromPoint(offset.left, offset.top);
            if ($(topElem).is(this.path)) {
                this.context.selectDots(dot);
            }
        });

        this.path.remove();
    }

    /**
     * @param {Event} e
     * @return {[x, y]} The (x,y) coordinates specified in the Event, made
     *   relative to the workspace.
     */
    _makeRelative(e) {
        let offset = $(".workspace").offset();
        let x = e.pageX - offset.left + this.scroll.left;
        let y = e.pageY - offset.top + this.scroll.top;
        return [x, y];
    }
}
