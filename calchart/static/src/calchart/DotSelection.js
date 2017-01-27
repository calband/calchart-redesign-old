/**
 * @file This file contains all the classes that customize the selection method
 * in the DotContext.
 */

import * as _ from "lodash";

import HTMLBuilder from "utils/HTMLBuilder";

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
    static init(context) {
        this.context = context;
        this.grapher = context.getGrapher();
        this.dots = this.grapher.getDots();

        this.scroll = {
            top: $(".workspace").scrollTop(),
            left: $(".workspace").scrollLeft(),
        };

        $(document).on({
            "mousemove.selection": e => {
                this.mousemove(e);
            },
            "mouseup.selection": e => {
                this.mouseup(e);
                this.finish();
            },
        });
    }

    /**
     * The function that is called when the user puts their mouse down on the field.
     *
     * @param {Event} e
     */
    static mousedown(e) {}

    /**
     * The function that is called when the user moves the mouse.
     *
     * @param {Event} e
     */
    static mousemove(e) {}

    /**
     * The function that is called when the user lifts their mouse.
     *
     * @param {Event} e
     */
    static mouseup(e) {}

    /**
     * Run any final actions to clean-up the selection class after mouseup is called.
     */
    static finish() {
        this.context = null;
        this.grapher = null;
        this.dots = null;
        this.scroll = null;
        $(document).off(".selection");
    }
}

/**
 * Selects a rectangular area of dots.
 */
export class BoxSelection extends BaseSelection {
    static mousedown(e) {
        this.start = e;
        HTMLBuilder.div("selection-box", null, $(".workspace"));
    }

    static mousemove(e) {
        let width = Math.abs(e.pageX - this.start.pageX);
        let height = Math.abs(e.pageY - this.start.pageY);

        // relative to workspace
        let offset = $(".workspace").offset();
        let minX = Math.min(e.pageX, this.start.pageX) - offset.left + this.scroll.left;
        let minY = Math.min(e.pageY, this.start.pageY) - offset.top + this.scroll.top;
        let maxX = minX + width;
        let maxY = minY + height;

        // update dimensions of the selection box
        $(".selection-box")
            .css({
                top: minY,
                left: minX,
                width: width,
                height: height,
            })
            .scrollIntoView({
                parent: ".workspace",
                callback: (deltaX, deltaY) => {
                    this.scroll.top += deltaY;
                    this.scroll.left += deltaX;
                },
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

    static mouseup(e) {
        $(".selection-box").remove();
    }
}
