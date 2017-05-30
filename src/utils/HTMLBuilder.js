/**
 * @file A collection of helper functions that simplify creating HTML elements.
 * Every function's arguments are optional, so can either be called with
 * those arguments in order, or passed in as an object. All functions return
 * a jQuery object.
 */

import { parseArgs } from "utils/JSUtils";

/**
 * A collection of helper functions that simplify creating HTML elements.
 * Every function's arguments are optional, so can either be called with
 * those arguments in order, or passed in as an object. All functions return
 * a jQuery object.
 */
export default class HTMLBuilder {
    /**
     * Make an HTML element as specified.
     *
     * @param {string} elem - The HTML element to make of the format:
     *   [TAG]#[ID].[CLASS]
     *   where ID and CLASS are optional and multiple classes may be
     *   specified. Examples: "p.message", "div#sidebar", "span.foo.bar".
     * @param {string} [text] - The text to set for the HTML element.
     */
    static make(elem, text) {
        let [match, tag, id, classes=""] = elem.match(/^(\w+)(?:#([\w-]+))?((?:\.[\w-]+)+)?$/);

        if (_.isNull(match)) {
            throw new Error(`Invalid format: ${elem}`);
        }

        tag = `<${tag}>`;
        classes = classes.slice(1).replace(/\./g, " ");

        return $(tag).attr("id", id).addClass(classes).text(text);
    }

    /**
     * Build a <div> element
     *
     * @param {string} class -- the class to add to the <div>
     * @param {(jQuery|jQuery[])} append -- the contents to append to the <div>
     */
    static div() {
        let args = parseArgs(arguments, ["class", "append"]);

        return $("<div>")
            .addClass(args.class)
            .append(args.append);
    }

    /**
     * Build an <i> element
     *
     * @param {string} name -- the name of the icon, without the "icon-" prefix
     * @param {string} class -- the class to add to the <i>
     */
    static icon() {
        let args = parseArgs(arguments, ["name", "class"]);

        return $("<i>")
            .addClass(`icon-${args.name}`)
            .addClass(args.class);
    }

    /**
     * Build an <img> element
     *
     * @param {string} src -- the image source
     */
    static img(src) {
        return $("<img>").attr("src", src);
    }

    /**
     * Build an <input> element
     *
     * @param {string} type - The type of the input.
     * @param {*} initial - The initial value of the input.
     * @param {function} change - The callback to run when the value is changed.
     */
    static input() {
        let args = parseArgs(arguments, ["type", "initial", "change"]);

        let input = $("<input>")
            .attr("type", args.type)
            .attr("value", args.initial)
            .change(args.change);

        if (args.type === "checkbox") {
            input.prop("checked", args.initial);
        }

        return input;
    }

    /**
     * Build a <label> element
     *
     * @param {string} text -- the text to show in the element
     * @param {string} class -- the class to add to the element
     */
    static label() {
        let args = parseArgs(arguments, ["text", "class"]);

        return $("<label>")
            .text(args.text)
            .addClass(args.class);
    }

    /**
     * Build an <li> element
     *
     * @param {string} text -- the text to show in the element
     * @param {string} class -- the class to add to the element
     */
    static li() {
        let args = parseArgs(arguments, ["text", "class"]);

        return $("<li>")
            .text(args.text)
            .addClass(args.class);
    }

    /**
     * Build a <select> element
     *
     * @param {object} options -- the options to add to the <select>, mapping
     *    the value of the option to the name.
     * @param {function} change -- the callback to run when an option is selected
     * @param {string} initial -- the value of the option to initially mark selected
     */
    static select() {
        let args = parseArgs(arguments, ["options", "change", "initial"]);

        let select = $("<select>").addClass(args.class).change(args.change);

        _.each(args.options, function(label, value) {
            $("<option>")
                .attr("value", value)
                .text(label)
                .appendTo(select);
        });

        return select.val(args.initial);
    }

    /**
     * Build a <span> element
     *
     * @param {string} text -- the text to put in the span
     * @param {string} class -- the class to add to the <span>
     */
    static span() {
        let args = parseArgs(arguments, ["text", "class"]);

        return $("<span>")
            .addClass(args.class)
            .text(args.text);
    }
}

