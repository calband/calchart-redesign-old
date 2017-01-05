var JSUtils = require("./JSUtils");
var MathUtils = require("./MathUtils");

/**
 * Contains functions to add to the jQuery API. Maps name of function to the function.
 */
var jQueryUtils = {};

/**
 * Convert a <select> element into a fancy dropdown. We use the Chosen library
 * (http://harvesthq.github.io/chosen/) to convert the selects and we style it
 * on our own in _mixins.scss. In order to support re-initializing Chosen dropdowns,
 * use this function to destroy any existing Chosen elements before initializing.
 *
 * @param {Object} options -- additional options to pass to the Chosen
 *      constructor, which override any defaults we set for all dropdowns.
 *      The full list of Chosen options can be found at
 *      https://harvesthq.github.io/chosen/options.html
 * @return {jQuery} this
 */
jQueryUtils.dropdown = function(options) {
    if (this.length > 1) {
        return this.each(function() {
            $(this).dropdown(options);
        });
    }

    // set default options
    var defaults = {
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
 * Scroll this element(s) if it's hidden inside the given parent
 *
 * @param {jQuery|undefined} parent -- the parent element to scroll
 *   if necessary. Defaults to parent of this element (or the first
 *   parent if multiple elements).
 * @param {object|undefined} options -- options, including:
 *   - {int} tolerance -- the distance from the edge needed to
 *     trigger scrolling, in pixels (default 0).
 *   - {int} margin -- the amount of space beyond the object to
 *     scroll (defaults to tolerance).
 *   - {function} callback -- a callback function that takes in
 *     the change in x/y positions
 */
jQueryUtils.scrollIntoView = function(parent, options) {
    // in case passing in options, with default parent
    if (typeof parent === "object" && !(parent instanceof jQuery)) {
        options = parent;
        parent = undefined;
    }

    parent = $(parent || this.parent()).first();
    var tolerance = JSUtils.get(options, "tolerance", 0);
    var margin = JSUtils.get(options, "margin", tolerance);

    // top/left of the visible part of the parent
    var parentOffset = parent.offset();
    var parentHeight = parent.outerHeight();
    var parentWidth = parent.outerWidth();

    // track furthest distance needed to scroll
    var scroll = {
        top: tolerance,
        bottom: -tolerance,
        left: tolerance,
        right: -tolerance,
    };

    this.each(function() {
        // relative to document; i.e. accounts for scroll
        var thisOffset = $(this).offset();

        // http://stackoverflow.com/a/20749186/4966649
        if (this instanceof SVGElement) {
            // SVG elements don't have an outerWidth or outerHeight
            // http://stackoverflow.com/a/9131261/4966649
            var dimensions = this.getBBox();
        } else {
            var dimensions = {
                width: $(this).outerWidth(),
                height: $(this).outerHeight(),
            };
        }

        // distance from left/right/top/bottom of the visible part of
        // the parent to the corresponding edge of this element
        var top = thisOffset.top - parentOffset.top;
        var bottom = top + dimensions.height - parentHeight;
        var left = thisOffset.left - parentOffset.left;
        var right = left + dimensions.width - parentWidth;

        scroll.top = Math.min(scroll.top, top);
        scroll.bottom = Math.max(scroll.bottom, bottom);
        scroll.left = Math.min(scroll.left, left);
        scroll.right = Math.max(scroll.right, right);
    });

    var deltaX = 0;
    var deltaY = 0;

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

    var parentScroll = {
        top: parent.scrollTop(),
        left: parent.scrollLeft(),
    };
    var scrollY = MathUtils.bound(parentScroll.top + deltaY, 0, parent.prop("scrollHeight") - parentHeight);
    var scrollX = MathUtils.bound(parentScroll.left + deltaX, 0, parent.prop("scrollWidth") - parentWidth);
    parent.scrollTop(scrollY);
    parent.scrollLeft(scrollX);

    if (options.callback) {
        options.callback(scrollX - parentScroll.left, scrollY - parentScroll.top);
    }
};

/**
 * Exports a function that takes in the jQuery operator and adds the
 * functions defined in jQueryUtils to the $.fn API
 */
module.exports = function($) {
    $.extend($.fn, jQueryUtils);
};
