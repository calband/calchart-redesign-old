/**
 * @file A collection of Field classes that can be rendered to create
 * form fields programmatically.
 */

import { NotImplementedError, ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { parseArgs } from "utils/JSUtils";

/**
 * The superclass for all Fields.
 */
class Field {
    /**
     * @param {string} name - The name of the form field.
     * @param {object} [options] - Options to customize the form field, including:
     *   - {string} label - The label of the field. Defaults to the name spaced out.
     *   - {*} initial - The initial value of the field.
     *   - {boolean} required - true if this field is required. Defaults to true.
     *   - {function} validate - 
     */
    constructor(name, options={}) {
        this._name = name;

        options = _.defaults({}, options, {
            label: _.capitalize(_.lowerCase(name)),
            initial: undefined,
            required: true,
        });

        this._label = options.label;
        this._initial = options.initial;
        this._required = options.required;

        this._field = null;
    }

    get name() {
        return this._name;
    }

    /**
     * @return {jQuery} The rendered form field.
     */
    render() {
        let field = HTMLBuilder.make(`div.field.${this._name}`);

        let label = _.defaultTo(this._label, _.capitalize(_.lowerCase(this._name)));
        HTMLBuilder.make("label", `${label}:`)
            .attr("for", name)
            .appendTo(field);

        this._field = this.renderField()
            .attr("name", this._name)
            .prop("required", this._required)
            .val(this._initial)
            .appendTo(field);

        return field;
    }

    /**
     * @return {jQuery} The form field input.
     */
    renderField() {
        throw new NotImplementedError(this);
    }

    /**** METHODS ****/

    /**
     * Validate this field, throwing a ValidationError if the field
     * fails validation.
     *
     * @return {*} The value of the field.
     */
    clean() {
        let value = this._field.val();

        if (this._required && value === "") {
            throw new ValidationError(`${this._label} is required.`);
        }

        return value;
    }

    getField() {
        if (_.isNull(this._field)) {
            this.render();
        }
        return this._field;
    }
}

export class BooleanField extends Field {
    renderField() {
        return HTMLBuilder.input("checkbox")
            .prop("checked", this._initial);
    }

    clean() {
        super.clean();
        return this._field.prop("checked");
    }
}

export class CharField extends Field {
    renderField() {
        return HTMLBuilder.input();
    }
}

export class FileField extends Field {
    /**
     * @param {string} name
     * @param {object} [options]
     *   - {string[]} extensions - Extensions to validate for the file.
     */
    constructor(name, options={}) {
        super(name, options);

        this._extensions = _.defaultTo(options.extensions, []);
    }

    renderField() {
        return HTMLBuilder.input("file");
    }

    clean() {
        let filename = super.clean();

        if (filename) {
            let extension = _.last(filename.split("."));
            if (this._extensions.indexOf(extension) === -1) {
                throw new ValidationError(`Invalid extension: ${extension}`);
            }
        }

        return this._field[0].files[0];
    }
}
