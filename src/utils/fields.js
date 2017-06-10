/**
 * @file A collection of Field classes that can be rendered to create
 * form fields programmatically.
 */

import { NotImplementedError, ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";

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
     * @return {jQuery} The rendered <div> container for a form field.
     */
    render() {
        let field = HTMLBuilder.make(`div.field.${this._name}`);

        let label = _.defaultTo(this._label, _.capitalize(_.lowerCase(this._name)));
        HTMLBuilder.make("label", `${label}:`)
            .attr("for", this._name)
            .appendTo(field);

        // store the actual form field in this._field
        this._field = this.renderField()
            .attr("id", this._name)
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

    /**
     * @return {jQuery}
     */
    getField() {
        if (_.isNull(this._field)) {
            this.render();
        }
        return this._field;
    }

    /**
     * Any actions to run after the popup has been shown.
     */
    onShow() {}
}

export class BooleanField extends Field {
    constructor(name, options={}) {
        // checkboxes need to be able to be unchecked
        options.required = false;
        super(name, options);
    }

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

export class ChoiceField extends Field {
    /**
     * @param {string} name
     * @param {object} choices - The options to add to the <select>, mapping
     *   the value of the option to the human-readable name.
     * @param {object} [options] - See Field options. Can also include:
     *   - {boolean} [multiple=false] - If true, allow multiple options to be
     *     chosen.
     *   - {object} [dropdown] - Any options to pass to the dropdown() call.
     */
    constructor(name, choices, options) {
        super(name, options);

        options = _.defaults({}, options, {
            multiple: false,
            dropdown: {},
        });

        this._choices = choices;
        this._multiple = options.multiple;
        this._dropdown = options.dropdown;
    }

    render() {
        let field = super.render();

        // handle checking required in clean()
        this._field.prop("required", false);

        return field;
    }

    renderField() {
        let select = HTMLBuilder.select(this._choices)
            .prop("multiple", this._multiple);

        // add an empty option to the beginning
        HTMLBuilder.make("option").prependTo(select);

        return select;
    }

    onShow() {
        this._field.dropdown(this._dropdown);
    }
}

/**
 * A field that renders as a dropdown and a number input, and when
 * the custom choice is selected, the number input can be edited.
 */
export class ChoiceOrNumberField extends ChoiceField {
    /**
     * @param {string} name
     * @param {object} choices
     * @param {object} [options]
     *   - {object} initial - the initial values for the two fields of the
     *     form: { choice: "foo", number: 1 }.
     *   - {boolean} positive - true if should validate to be > 0. Defaults
     *     to false.
     */
    constructor(name, choices, options) {
        super(name, choices, options);

        let { choice, number } = this._initial;
        this._initial = choice;
        this._initialNumber = number;

        this._positive = _.defaultTo(options.positive, false);
    }

    render() {
        let field = super.render();

        let name = _.upperFirst(this._name);
        HTMLBuilder
            .input({
                type: "number",
                initial: this._initialNumber,
            })
            .attr("name", `custom${name}`)
            .appendTo(field);

        field.find("select").change();
        return field;
    }

    renderField() {
        let select = super.renderField();
        select.change(e => {
            let disabled = select.val() !== "custom";
            select.siblings("input").prop("disabled", disabled);
        });
        return select;
    }

    clean() {
        let value = this._field.val();

        if (value === "custom") {
            value = this._field.siblings("input").val();
            if (this._required && value === "") {
                throw new ValidationError(`${this._label} is required`);
            }

            value = parseInt(value);
            if (this._positive && value <= 0) {
                throw new ValidationError(`${this._label} needs to be a positive integer.`);
            }
        }

        return value;
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
            if (!_.includes(this._extensions, extension)) {
                throw new ValidationError(`Invalid extension: ${extension}`);
            }
        }

        return this._field[0].files[0];
    }
}

export class NumberField extends Field {
    /**
     * @param {string} name
     * @param {object} [options]
     *   - {boolean} positive - true if should validate to be > 0. Defaults
     *     to false.
     */
    constructor(name, options={}) {
        super(name, options);

        this._positive = _.defaultTo(options.positive, false);
    }

    renderField() {
        return HTMLBuilder.input("number");
    }

    clean() {
        let value = super.clean();
        value = parseInt(value);

        if (this._positive && value <= 0) {
            throw new ValidationError(`${this._label} needs to be a positive integer.`);
        }

        return value;
    }
}

export class TextField extends Field {
    renderField() {
        return HTMLBuilder.make("textarea");
    }
}
