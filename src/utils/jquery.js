/**
 * @file Adds custom jQuery functions to the jQuery operator loaded in the HTML. Usage:
 *
 * import "utils/jquery";
 * $(function() {
 *    // actions to run when document is ready
 * });
 */

if (_.isUndefined($)) {
    console.error("jQuery is not loaded!");
}
if (_.isUndefined($.fn.chosen)) {
    console.error("Chosen is not loaded!");
}

/**
 * Convert the given d3 selections to jQuery selections.
 *
 * @param {D3} selection
 * @param {jQuery}
 */
$.fromD3 = function(selection) {
    return $(selection.nodes());
};

/**
 * Helper function to set the value of a select and refresh the dropdown.
 */
$.fn.choose = function(opt) {
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
$.fn.clickOff = function() {
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
$.fn.dropdown = function(options) {
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
$.fn.exists = function() {
    return this.length !== 0;
};

/**
 * If this element is offscreen, position it to be onscreen.
 */
$.fn.keepOnscreen = function() {
    let offset = this.offset();
    return this.smartPosition(offset.top, offset.left, {
        fromRight: 10,
        fromBottom: 10,
    });
};

/**
 * Prevent this element from scrolling.
 */
$.fn.lockScroll = function() {
    this.addClass("no-scroll");
};

/**
 * Convert the given (x,y) page coordinates to be relative to this element.
 *
 * @param {number} pageX
 * @param {number} pageY
 * @return {[x, y]}
 */
$.fn.makeRelative = function(pageX, pageY) {
    let offset = this.offset();
    let x = pageX - offset.left + this.scrollLeft();
    let y = pageY - offset.top + this.scrollTop();
    return [x, y];
};

/**
 * Check that clicking on this element is not clicking in the given element
 *
 * @param {jQuery} element
 * @return {boolean} true if this element is not in the given element
 */
$.fn.notIn = function(element) {
    return !this.closest(element).exists();
};

/**
 * Capture the pinch gesture on trackpads, which is the same as scrolling
 * with the ctrl key pressed (http://stackoverflow.com/a/28685082/4966649).
 *
 * @param {function(Event)} callback - The callback to run when a pinch is
 *   detected. The event will have deltaY defined, which represents the velocity
 *   of the pinch. A positive deltaY means the pinch is getting wider apart.
 */
$.fn.pinch = function(callback) {
    return this.on("wheel", function(e) {
        if (e.ctrlKey) {
            e.deltaY = -e.originalEvent.deltaY;
            callback(e);
        }
    });
};

/**
 * Remove all classes from this object that match the given pattern.
 *
 * @param {String|regex} pattern
 */
$.fn.removeClassRegex = function(pattern) {
    return this.each((i, elem) => {
        let classes = elem.className.split(" ").filter(
            cls => _.isNull(cls.match(pattern))
        );
        elem.className = classes.join(" ");
    });
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
$.fn.scrollIntoView = function(options={}) {
    let { tolerance=0, margin=tolerance } = options;

    // top/left of the visible part of the parent
    let parent = $(_.defaultTo(options.parent, this.parent()));
    let parentOffset = parent.offset();
    let parentHeight = parent.outerHeight();
    let parentWidth = parent.outerWidth();

    // track furthest distance needed to scroll
    let scroll = {
        top: Infinity,
        bottom: -Infinity,
        left: Infinity,
        right: -Infinity,
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

    let deltaY;
    if (scroll.top <= tolerance && scroll.bottom >= -tolerance) {
        // if elements hidden on both top and bottom
        deltaY = 0;
    } else if (scroll.bottom - scroll.top > parentHeight) {
        // if elements longer than height of parent
        deltaY = 0;
    } else if (scroll.top <= tolerance) {
        deltaY = scroll.top - margin;
    } else if (scroll.bottom >= -tolerance) {
        // dont scroll past top-most element
        deltaY = Math.min(scroll.bottom, scroll.top) + margin;
    } else {
        deltaY = 0;
    }

    let deltaX;
    if (scroll.left <= tolerance && scroll.right >= -tolerance) {
        // if elements hidden on both left and right, don't scroll
        deltaX = 0;
    } else if (scroll.right - scroll.left > parentWidth) {
        // if elements longer than width of parent
        deltaX = 0;
    } else if (scroll.left <= tolerance) {
        deltaX = scroll.left - margin;
    } else if (scroll.right >= -tolerance) {
        // dont scroll past left-most element
        deltaX = Math.min(scroll.right + margin, scroll.left - margin);
    } else {
        deltaX = 0;
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
 * When scrollLeft() and scrollTop() take in a float, it always rounds up to
 * the nearest integer. Overriding to round up/down to the nearest integer.
 */
$.fn._scrollLeft = $.fn.scrollLeft;
$.fn._scrollTop = $.fn.scrollTop;
$.fn.scrollLeft = function(val) {
    if (arguments.length === 0) {
        return this._scrollLeft();
    } else {
        return this._scrollLeft(Math.round(val));
    }
}
$.fn.scrollTop = function(val) {
    if (arguments.length === 0) {
        return this._scrollTop();
    } else {
        return this._scrollTop(Math.round(val));
    }
}

/**
 * Position this element at the given position in the top, left corner. If
 * the element goes offscreen to the right, position the element on the left
 * instead. If the element goes below the screen, position the element on the
 * top instead.
 *
 * @param {float} top - The position of the top edge of the element, unless
 *   offscreen.
 * @param {float} left - The position of the left edge of the element,
 *   unless offscreen.
 * @param {Object} [options] - Options to customize positioning:
 *   - {float} [offTop=0] - The position of the top edge of the element, if the
 *     top edge of the element goes offscreen.
 *   - {float} [offLeft=0] - The position of the left edge of the element, if the
 *     left edge of the element goes offscreen.
 *   - {float} [offRight=left] - The position of the right edge of the element,
 *     if the right edge of the element goes offscreen.
 *   - {float} [offBottom=top] - The position of the bottom edge of the element,
 *     if the bottom edge of the element goes offscreen.
 *   - {float} [fromRight] - The distance from the right edge to the right edge
 *     of the screen, if the right edge of the element goes offscreen.
 *   - {float} [fromBottom] - The distance from the bottom edge to the bottom edge
 *     of the screen, if the bottom edge of the element goes offscreen.
 */
$.fn.smartPosition = function(top, left, options={}) {
    options = _.defaults(options, {
        offTop: 0,
        offLeft: 0,
        offRight: left,
        offBottom: top,
    });

    let position = {
        top: top,
        left: left,
    };

    let width = this.outerWidth();
    let maxWidth = $(window).width();
    if (left < 0) {
        position.left = options.offLeft;
    } else if (left + width > maxWidth) {
        let right = _.defaultTo(maxWidth - options.fromRight, options.offRight);
        position.left = right - width;
    }

    let height = this.outerHeight();
    let maxHeight = $(window).height();
    if (top < 0) {
        position.top = options.offTop;
    } else if (top + height > maxHeight) {
        let bottom = _.defaultTo(maxHeight - options.fromBottom, options.offBottom);
        position.top = bottom - height;
    }

    return this.css(position);
};

/**
 * Re-enable this element from scrolling after calling lockScroll.
 */
$.fn.unlockScroll = function() {
    this.removeClass("no-scroll");
};
