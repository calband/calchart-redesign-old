import Show from "calchart/Show";
import EditorController from "controllers/EditorController";
import FormPopup from "popups/FormPopup";

import { DOT_FORMATS, SHOW_FIELD_TYPES } from "utils/CalchartUtils";
import { ChoiceField, NumberField } from "utils/fields";

/**
 * The popup to setup a show when first opening it in the editor.
 */
export default class SetupShowPopup extends FormPopup {
    /**
     * @param {string} name - The name of the show.
     * @param {string} slug - The slug of the show.
     * @param {boolean} isBand - true if the show is a band show.
     */
    constructor(name, slug, isBand) {
        super();

        this._name = name;
        this._slug = slug;
        this._isBand = isBand;
    }

    get info() {
        return {
            name: "setup-show",
            title: "Set Up Show",
        };
    }

    getButtons() {
        let buttons = super.getButtons();

        // no cancel button
        _.pullAt(buttons, 1);

        return buttons;
    }

    getFields() {
        let fieldType = new ChoiceField("fieldType", SHOW_FIELD_TYPES, {
            initial: "college",
        });

        return [
            new NumberField("numDots", {
                label: "Number of dots",
                positive: true,
            }),
            new ChoiceField("dotFormat", DOT_FORMATS, {
                initial: "combo",
            }),
            fieldType,
        ];
    }

    /**
     * This popup can't be hidden unless saved successfully
     */
    hide() {}

    onSave(data) {
        let show = Show.create(this._name, this._slug, this._isBand, data);
        let controller = EditorController.init(show);
        controller.saveShow();

        // manually hide popup
        super.hide();
        return false;
    }
}
