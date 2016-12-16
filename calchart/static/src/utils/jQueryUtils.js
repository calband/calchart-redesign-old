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
        search_contains: true,
    };
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
 *   - {int} margin -- the amount of space beyond the object to
 *     scroll (default 0).
 */
jQueryUtils.scrollToView = function(parent, options) {
    // in case passing in options, with default parent
    if (typeof parent === "object" && !(parent instanceof jQuery)) {
        options = parent;
        parent = undefined;
    }

    parent = $(parent || this.parent()).first();
    options = options || {};
    var margin = options.margin || 0;

    var parentOffset = parent.offset();
    var parentHeight = parent.outerHeight();
    var parentWidth = parent.outerWidth();

    // track furthest distance needed to scroll
    var scroll = {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
    };

    this.each(function() {
        var thisOffset = $(this).offset();

        // distance from left/right/top/bottom of the parent to the
        // corresponding edge of this element
        var left = thisOffset.left - parentOffset.left;
        var right = left + $(this).outerWidth() - parentWidth;
        var top = thisOffset.top - parentOffset.top;
        var bottom = top + $(this).outerHeight() - parentHeight;

        scroll.minX = Math.min(scroll.minX, left);
        scroll.maxX = Math.max(scroll.maxX, right);
        scroll.minY = Math.min(scroll.minY, top);
        scroll.maxY = Math.max(scroll.maxY, bottom);
    });

    if (scroll.minX < 0 && scroll.maxX > 0) {
        // if elements hidden on both left and right, don't scroll
    } else if (scroll.minX < 0) {
        parent.scrollLeft(parent.scrollLeft() + scroll.minX - margin);
    } else if (scroll.maxX > 0) {
        parent.scrollLeft(parent.scrollLeft() + scroll.maxX + margin);
    }

    if (scroll.minY < 0 && scroll.maxY > 0) {
        // if elements hidden on both top and bottom, don't scroll
    } else if (scroll.minY < 0) {
        parent.scrollTop(parent.scrollTop() + scroll.minY - margin);
    } else if (scroll.maxY > 0) {
        parent.scrollTop(parent.scrollTop() + scroll.maxY + margin);
    }
};

/**
 * Exports a function that takes in the jQuery operator and adds the
 * functions defined in jQueryUtils to the $.fn API
 */
module.exports = function($) {
    $.extend($.fn, jQueryUtils);
};
