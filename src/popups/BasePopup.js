import { NotImplementedError, ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { attempt } from "utils/JSUtils";
import { showError } from "utils/UIUtils";

/**
 * The base class for any popups in Calchart.
 */
export default class BasePopup {
    constructor() {
        this._popup = null;
    }

    /**
     * @return {object} meta info for this popup, including the following keys:
     *   - {string} name - The short, unique name of the popup; e.g. "create-show"
     *   - {string} [title] - The title to use for the popup (defaults to the name
     *     capitalized); e.g. "Create Show"
     */
    get info() {
        throw new NotImplementedError(this);
    }

    /**
     * Display this popup.
     */
    show() {
        let title = this.getTitle();
        let fields = this.getFields();
        let buttons = this.getButtons();

        let form = HTMLBuilder.make("form");
        fields.forEach(field => {
            form.append(field.render());
        });
        HTMLBuilder.div("buttons")
            .append(buttons)
            .appendTo(form);

        let popupBox = HTMLBuilder.make("div.popup-box")
            .addClass(this.info.name)
            .append(title)
            .append(form);

        this._popup = HTMLBuilder.make("div.popup")
            .append(popupBox)
            .appendTo("body");

        // event listener to save popup
        this._popup.submit(e => {
            e.preventDefault();

            let data = attempt(() => {
                let data = {};

                fields.forEach(field => {
                    data[field.name] = field.clean();
                });

                return data;
            }, {
                class: ValidationError,
                callback: ex => {
                    showError(ex.message);
                },
            });

            if (_.isNull(data)) {
                return;
            }

            let result = this.onSave(data);

            // if onSave returned false explicitly don't hide the popup
            if (result !== false) {
                this.hide();
            }
        });

        // event listeners to close popup
        this._popup.click(e => {
            if ($(e.target).is("button.cancel") || $(e.target).is(this._popup)) {
                this.hide();
            }
        });

        // ESC closes popup
        $(window).on("keydown.popup", e => {
            if (e.which === 27) {
                this.hide();
            }
        });

        // auto focus on first input
        fields[0].getField().focus();

        this.onInit();
    }

    /**
     * Hide this popup.
     */
    hide() {
        this._popup.remove();
        this._popup = null;

        $(window).off(".popup");
    }

    /**** HOOKS ****/

    /**
     * @return {jQuery[]} The buttons in the popup.
     */
    getButtons() {
        return [
            HTMLBuilder.make("button.save", "Save"),
            HTMLBuilder.make("button.cancel", "Cancel").attr("type", "button"),
        ];
    }

    /**
     * @return {Field[]} The form fields in the popup.
     */
    getFields() {
        throw new NotImplementedError(this);
    }

    /**
     * @return {jQuery} The title of the popup.
     */
    getTitle() {
        let title = this.info.title;
        if (_.isUndefined(title)) {
            title = _.startCase(this.info.name.replace("-", " "));
        }
        return HTMLBuilder.make("h1", title);
    }

    /**
     * Any actions to run after the popup is displayed.
     */
    onInit() {}

    /**
     * Any actions to run when the Save button is clicked.
     *
     * @param {object} data - The data in the popup.
     * @return {(undefined|boolean)} Return an explicit false to prevent
     *   the popup from hiding.
     */
    onSave(data) {}
}
