/**
 * @file A collection of helper functions that simplify creating HTML elements.
 * Every function's arguments are optional, so can either be called with
 * those arguments in order, or passed in as an object. All functions return
 * a jQuery object.
 */

import * as _ from "lodash";

import { parseArgs, toCamelCase } from "utils/JSUtils";

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
     * @param {jQuery} appendTo - The element to append the element to.
     */
    static make(elem, appendTo) {
        let [match, tag, id, classes=""] = elem.match(/^(\w+)(?:#([\w-]+))?((?:\.[\w-]+)+)?$/);

        if (_.isNull(match)) {
            throw new Error(`Invalid format: ${elem}`);
        }

        tag = `<${tag}>`;
        classes = classes.slice(1).replace(/\./g, " ");

        let element = $(tag).attr("id", id).addClass(classes);
        if (appendTo) {
            element.appendTo(appendTo);
        }
        return element;
    }

    /**
     * Build a <div> element
     *
     * @param {string} class -- the class to add to the <div>
     * @param {(jQuery|jQuery[])} append -- the contents to append to the <div>
     * @param {jQuery} appendTo -- the element to append the <div> to
     */
    static div() {
        let args = JSUtils.parseArgs(arguments, ["class", "append", "appendTo"]);

        let div = $("<div>")
            .addClass(args.class)
            .append(args.append);

        if (args.appendTo) {
            div.appendTo(args.appendTo);
        }

        return div;
    }

    /**
     * Build a <div> element for a form field
     *
     * @param {string} label -- the label for the field
     * @param {jQuery|string} field -- the field to wrap in the form field, either
     *    the HTML element itself or a string to pass to HTMLBuilder.make
     * @param {string} name -- the name attribute for the field (defaults to label as camel case)
     */
    static formfield() {
        let args = JSUtils.parseArgs(arguments, ["label", "field", "name"]);
        let name = args.name || JSUtils.toCamelCase(args.label);

        if (_.isString(args.field)) {
            args.field = this.make(args.field);
        }
        args.field
            .attr("name", name)
            .attr("id", name);

        let label = $("<label>")
            .attr("for", name)
            .text(`${args.label}:`);

        return $("<div>")
            .addClass(`field ${name}`)
            .append([label, args.field]);
    }

    /**
     * Build an <i> element
     *
     * @param {string} name -- the name of the icon, without the "icon-" prefix
     * @param {string} class -- the class to add to the <i>
     */
    static icon() {
        let args = JSUtils.parseArgs(arguments, ["name", "class"]);

        return $("<i>").addClass(`icon-${args.name} ${args.class}`);
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
     * @param {string} class -- the class to add to the <input>
     * @param {string} type -- the type of the input
     * @param {string} name -- the name of the input
     * @param {string|float} initial -- the initial value of the input
     * @param {function} change -- the callback to run when the value is changed
     */
    static input() {
        let args = JSUtils.parseArgs(arguments, ["class", "type", "name", "initial", "change"]);

        return $("<input>")
            .addClass(args.class)
            .attr("type", args.type)
            .attr("name", args.name)
            .attr("value", args.initial)
            .change(args.change);
    }

    /**
     * Build a <label> element
     *
     * @param {string} text -- the text to show in the element
     * @param {string} class -- the class to add to the element
     */
    static label() {
        let args = JSUtils.parseArgs(arguments, ["text", "class"]);

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
        let args = JSUtils.parseArgs(arguments, ["text", "class"]);

        return $("<li>")
            .text(args.text)
            .addClass(args.class);
    }

    /**
     * Build a <select> element
     *
     * @param {object} options -- the options to add to the <select>, mapping
     *    the value of the option to the name.
     * @param {string} class -- the class to add to the <select>
     * @param {function} change -- the callback to run when an option is selected
     * @param {string} initial -- the value of the option to initially mark selected
     */
    static select() {
        let args = JSUtils.parseArgs(arguments, ["options", "class", "change", "initial"]);

        let select = $("<select>").addClass(args.class).change(args.change);

        $.each(args.options, function(value, label) {
            $("<option>")
                .attr("value", value)
                .prop("selected", value === args.initial)
                .text(label)
                .appendTo(select);
        });

        return select;
    }

    /**
     * Build a <span> element
     *
     * @param {string} text -- the text to put in the span
     * @param {string} class -- the class to add to the <span>
     */
    static span() {
        let args = JSUtils.parseArgs(arguments, ["text", "class"]);

        return $("<span>")
            .addClass(args.class)
            .text(args.text);
    }
}

