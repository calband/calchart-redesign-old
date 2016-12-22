/**
 * A collection of helper functions that simplify creating HTML elements.
 * Every function's arguments are optional, so can either be called with
 * those arguments in order, or passed in as an object. All functions return
 * a jQuery object.
 */
var HTMLBuilder = {};

/**
 * Helper function to parse arbitrary arguments
 *
 * @param {Array} args -- the arguments passed to the original function, with
 *   either an object passed as the only argument (to be used as all the
 *   arguments), or the arguments in order as defined by labels.
 * @param {Array<string>} labels -- the names of each argument, in order
 * @return {object} the arguments passed in
 */
var _parseArgs = function(args, labels) {
    if (args.length === 1) {
        var arg = args[0];
        if (arg !== null && typeof arg === "object") {
            return arg;
        }
    }

    var _args = {};
    $.each(labels, function(i, label) {
        _args[label] = args[i];
    });
    return _args;
};

/**
 * Make an HTML element as specified
 *
 * @param {string} elem -- the HTML element to make of the format
 *   [TAG]#[ID].[CLASS]
 *   where ID and CLASS are optional and multiple classes may be
 *   specified. Examples: "p.message", "div#sidebar", "span.foo.bar"
 * @param {jQuery} appendTo -- the element to append the element to
 */
HTMLBuilder.make = function(elem, appendTo) {
    var match = elem.match(/^(\w+)(?:#([\w-]+))?((?:\.[\w-]+)+)?$/);
    var tag = "<" + match[1] + ">";
    var id = match[2];
    var classes = match[3].slice(1).replace(".", " ");

    var element = $(tag).attr("id", id).addClass(classes);
    if (appendTo) {
        element.appendTo(appendTo);
    }
    return element;
};

/**** TAG SPECIFIC ****/

/**
 * Builds a <div> element, with the given parameters:
 *  - {string} class -- the class to add to the <div>
 *  - {jQuery|Array<jQuery>} append -- the contents to append to the <div>
 *  - {jQuery} appendTo -- the element to append the <div> to
 */
HTMLBuilder.div = function() {
    var args = _parseArgs(arguments, ["class", "append", "appendTo"]);

    var div = $("<div>")
        .addClass(args.class)
        .append(args.append);

    if (args.appendTo) {
        div.appendTo(args.appendTo);
    }

    return div;
};

/**
 * Builds an <i> element, with the given parameters:
 *  - {string} name -- the name of the icon, without the "icon-" prefix
 *  - {string} class -- the class to add to the <i>
 */
HTMLBuilder.icon = function() {
    var args = _parseArgs(arguments, ["name", "class"]);

    return $("<i>").addClass("icon-" + args.name + " " + args.class);
};

/**
 * Builds an <img> element, with the given parameters:
 *  - {string} src -- the image source
 */
HTMLBuilder.img = function(src) {
    return $("<img>").attr("src", src);
};

/**
 * Builds a <select> element, with the given parameters:
 *  - {string} class -- the class to add to the <select>
 *  - {object} options -- the options to add to the <select>, mapping
 *    the value of the option to the name.
 *  - {function} change -- the callback to run when an option is selected
 */
HTMLBuilder.select = function() {
    var args = _parseArgs(arguments, ["class", "options", "change"]);

    var select = $("<select>").addClass(args.class).change(args.change);

    $.each(args.options, function(value, label) {
        $("<option>")
            .attr("value", value)
            .text(label)
            .appendTo(select);
    });

    return select;
};

/**
 * Builds a <span> element, with the given parameters:
 *  - {string} class -- the class to add to the <span>
 *  - {string} text -- the text to put in the span
 *  - {jQuery} appendTo -- the element to append the <span> to
 */
HTMLBuilder.span = function() {
    var args = _parseArgs(arguments, ["class", "text", "appendTo"]);

    var span = $("<span>")
        .addClass(args.class)
        .text(args.text);

    if (args.appendTo) {
        span.appendTo(args.appendTo);
    }

    return span;
};

module.exports = HTMLBuilder;
