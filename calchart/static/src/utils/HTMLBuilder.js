var JSUtils = require("./JSUtils");

/**
 * A collection of helper functions that simplify creating HTML elements.
 * Every function's arguments are optional, so can either be called with
 * those arguments in order, or passed in as an object. All functions return
 * a jQuery object.
 */
var HTMLBuilder = {};

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
    var classes = (match[3] || "").slice(1).replace(".", " ");

    var element = $(tag).attr("id", id).addClass(classes);
    if (appendTo) {
        element.appendTo(appendTo);
    }
    return element;
};

/**** TAG SPECIFIC ****/

/**
 * Builds a <div> element
 *
 *  @param {string} class -- the class to add to the <div>
 *  @param {jQuery|Array<jQuery>} append -- the contents to append to the <div>
 *  @param {jQuery} appendTo -- the element to append the <div> to
 */
HTMLBuilder.div = function() {
    var args = JSUtils.parseArgs(arguments, ["class", "append", "appendTo"]);

    var div = $("<div>")
        .addClass(args.class)
        .append(args.append);

    if (args.appendTo) {
        div.appendTo(args.appendTo);
    }

    return div;
};

/**
 * Builds a <div> element for a form field
 *
 *  @param {string} label -- the label for the field
 *  @param {jQuery|string} field -- the field to wrap in the form field, either
 *    the HTML element itself or a string to pass to HTMLBuilder.make
 *  @param {string} name -- the name attribute for the field (defaults to label slugified)
 */
HTMLBuilder.formfield = function() {
    var args = JSUtils.parseArgs(arguments, ["label", "field", "name"]);
    var name = args.name || JSUtils.slugify(args.label);

    if (typeof args.field === "string") {
        args.field = this.make(args.field);
    }
    args.field
        .attr("name", name)
        .attr("id", name);

    var label = $("<label>")
        .attr("for", name)
        .text(args.label + ":");

    return $("<div>")
        .addClass("field " + name)
        .append([label, args.field]);
};

/**
 * Builds an <i> element
 *
 *  @param {string} name -- the name of the icon, without the "icon-" prefix
 *  @param {string} class -- the class to add to the <i>
 */
HTMLBuilder.icon = function() {
    var args = JSUtils.parseArgs(arguments, ["name", "class"]);

    return $("<i>").addClass("icon-" + args.name + " " + args.class);
};

/**
 * Builds an <img> element
 *
 *  @param {string} src -- the image source
 */
HTMLBuilder.img = function(src) {
    return $("<img>").attr("src", src);
};

/**
 * Builds an <li> element
 *
 *  @param {string} text -- the text to show in the element
 *  @param {string} class -- the class to add to the element
 */
HTMLBuilder.li = function() {
    var args = JSUtils.parseArgs(arguments, ["text", "class"]);

    return $("<li>")
        .text(args.text)
        .addClass(args.class);
};

/**
 * Builds a <select> element
 *
 *  @param {object} options -- the options to add to the <select>, mapping
 *    the value of the option to the name.
 *  @param {string} class -- the class to add to the <select>
 *  @param {function} change -- the callback to run when an option is selected
 *  @param {string} selected -- the value of the option to mark selected
 */
HTMLBuilder.select = function() {
    var args = JSUtils.parseArgs(arguments, ["options", "class", "change", "selected"]);

    var select = $("<select>").addClass(args.class).change(args.change);

    $.each(args.options, function(value, label) {
        $("<option>")
            .attr("value", value)
            .prop("selected", value === args.selected)
            .text(label)
            .appendTo(select);
    });

    return select;
};

/**
 * Builds a <span> element
 *
 *  @param {string} class -- the class to add to the <span>
 *  @param {string} text -- the text to put in the span
 *  @param {jQuery} appendTo -- the element to append the <span> to
 */
HTMLBuilder.span = function() {
    var args = JSUtils.parseArgs(arguments, ["class", "text", "appendTo"]);

    var span = $("<span>")
        .addClass(args.class)
        .text(args.text);

    if (args.appendTo) {
        span.appendTo(args.appendTo);
    }

    return span;
};

module.exports = HTMLBuilder;
