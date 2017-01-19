/**
 * @file Exposes the jQuery operator from the jquery package, with
 * additional methods defined in the jQueryUtils object, and puts
 * the operator in the global scope. Usage:
 *
 * import "utils/jquery";
 * $(function() {
 *    // actions to run when document is ready
 * });
 */

import jQuery from "jquery";
import * as _ from "lodash";

// jQuery plugins
import "chosen-js";
import "jquery-mousewheel";

// expose the jQuery operator to the global scope
window.$ = jQuery;
window.jQuery = jQuery;

/**
 * Contains functions to add to the jQuery API.
 * @type {Object.<string, function>}
 */
let jQueryUtils = {};

/**
 * Helper function to set the value of a select and refresh the dropdown.
 */
jQueryUtils.choose = function(opt) {
    return this.val(opt).trigger("chosen:updated");
};

/**
 * Run a callback function if the user clicks off this element. If run without
 * arguments, triggers the callback.
 *
 * @param {function(Event)} [callback] - The function to run when anything
 *   besides this element is clicked on. After the callback runs once, it is
 *   removed.
 * @param {jQuery} [parent=Window] - The parent to listen for clicks
 * @return {jQuery} @this
 */
jQueryUtils.clickOff = function() {
    if (arguments.length === 0) {
        this.data("callback").call(this);
        $(parent).off(".clickOff");
        return;
    }

    let [callback, parent=window] = arguments;

    $(parent).on("click.clickOff", (e) => {
        if ($(e.target).notIn(this)) {
            callback.call(this, e);
            $(parent).off(e);
        }
    });

    this.data("callback", callback);

    return this;
};

/**
 * Convert a <select> element into a fancy dropdown. We use the
 * [Chosen library]{@link http://harvesthq.github.io/chosen/} to
 * convert the selects.
 *
 * @param {Object} [options] - Additional options to pass to the Chosen
 *      constructor, which override any defaults we set for all dropdowns.
 *      The full list of Chosen options can be found at
 *      {@link https://harvesthq.github.io/chosen/options.html}.
 * @return {jQuery} @this
 */
jQueryUtils.dropdown = function(options) {
    if (this.length > 1) {
        return this.each(function() {
            $(this).dropdown(options);
        });
    }

    // set default options
    let defaults = {
        placeholder_text_single: "------",
        disable_search_threshold: 10,
    };
    // until https://github.com/harvesthq/chosen/issues/92 is resolved
    if (!this.is(":visible")) {
        defaults.width = this.css("width");
    }
    options = $.extend(defaults, options);

    // destroy Chosen if exists
    if (this.data("chosen") !== undefined) {
        this.chosen("destroy");
    }

    return this.chosen(options);
};

/**
 * @return {boolean} true if the given jQuery selection exists
 */
jQueryUtils.exists = function() {
    return this.length !== 0;
};

/**
 * Check that clicking on this element is not clicking in the given element
 *
 * @param {jQuery} element
 * @return {boolean} true if this element is not in the given element
 */
jQueryUtils.notIn = function(element) {
    return !this.closest(element).exists();
};

/**
 * Scroll this element(s) if it's hidden inside the given parent
 *
 * @param {Object} [options] - Additional options, including:
 *   - {(jQuery|string)} parent - The parent element to scroll if
 *     necessary. Defaults to the parent of this element.
 *   - {int} [tolerance=0] - The distance from the edge needed to
 *     trigger scrolling, in pixels.
 *   - {int} [margin=tolerance] - The amount of space beyond the object
 *     to scroll.
 *   - {function(number, number)} [callback] - A callback function that
 *     takes in the change in x/y positions.
 */
jQueryUtils.scrollIntoView = function(options={}) {
    let { tolerance=0, margin=tolerance } = options;

    // top/left of the visible part of the parent
    let parent = $(_.defaultTo(options.parent, this.parent()));
    let parentOffset = parent.offset();
    let parentHeight = parent.outerHeight();
    let parentWidth = parent.outerWidth();

    // track furthest distance needed to scroll
    let scroll = {
        top: tolerance,
        bottom: -tolerance,
        left: tolerance,
        right: -tolerance,
    };

    this.each(function() {
        // relative to document; i.e. accounts for scroll
        let thisOffset = $(this).offset();
        let dimensions;

        // http://stackoverflow.com/a/20749186/4966649
        if (this instanceof SVGElement) {
            // SVG elements don't have an outerWidth or outerHeight
            // http://stackoverflow.com/a/9131261/4966649
            dimensions = this.getBBox();
        } else {
            dimensions = {
                width: $(this).outerWidth(),
                height: $(this).outerHeight(),
            };
        }

        // distance from left/right/top/bottom of the visible part of
        // the parent to the corresponding edge of this element
        let top = thisOffset.top - parentOffset.top;
        let bottom = top + dimensions.height - parentHeight;
        let left = thisOffset.left - parentOffset.left;
        let right = left + dimensions.width - parentWidth;

        scroll.top = Math.min(scroll.top, top);
        scroll.bottom = Math.max(scroll.bottom, bottom);
        scroll.left = Math.min(scroll.left, left);
        scroll.right = Math.max(scroll.right, right);
    });

    let deltaX = 0;
    let deltaY = 0;

    if (scroll.top < tolerance && scroll.bottom > -tolerance) {
        // if elements hidden on both top and bottom, don't scroll
    } else if (scroll.top < tolerance) {
        deltaY = scroll.top - margin;
    } else if (scroll.bottom > -tolerance) {
        deltaY = scroll.bottom + margin;
    }

    if (scroll.left < tolerance && scroll.right > -tolerance) {
        // if elements hidden on both left and right, don't scroll
    } else if (scroll.left < tolerance) {
        deltaX = scroll.left - margin;
    } else if (scroll.right > -tolerance) {
        deltaX = scroll.right + margin;
    }

    let parentScroll = {
        top: parent.scrollTop(),
        left: parent.scrollLeft(),
    };
    let scrollY = _.clamp(parentScroll.top + deltaY, 0, parent.prop("scrollHeight") - parentHeight);
    let scrollX = _.clamp(parentScroll.left + deltaX, 0, parent.prop("scrollWidth") - parentWidth);
    parent.scrollTop(scrollY);
    parent.scrollLeft(scrollX);

    if (options.callback) {
        options.callback(scrollX - parentScroll.left, scrollY - parentScroll.top);
    }
};

/**
 * Position this element at the given position in the top, left corner. If
 * the element goes offscreen to the right, position the element on the left
 * instead. If the element goes below the screen, position the element so
 * that its bottom edge is on the bottom of the screen.
 *
 * @param {float} top - The position of the top edge of the element, unless
 *   offscreen.
 * @param {float} left - The position of the left edge of the element,
 *   unless offscreen.
 * @param {float} [right=left] - The position of the right edge of the
 *   element, if it goes offscreen.
 */
jQueryUtils.smartPosition = function(top, left, right=left) {
    let position = {
        top: top,
        left: left,
    };

    let width = this.outerWidth();
    let maxWidth = $(window).width();
    if (left + width > maxWidth) {
        position.left = right - width;
    }

    let height = this.outerHeight();
    let maxHeight = $(window).height();
    if (top + height > maxHeight) {
        position.top = maxHeight - height;
    }

    return this.css(position);
};

$.extend($.fn, jQueryUtils);
