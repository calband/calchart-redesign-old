import Show from "calchart/Show";
import EditorController from "controllers/EditorController";
import BasePopup from "popups/BasePopup";

import { DOT_FORMATS, FIELD_TYPES } from "utils/CalchartUtils";
import { ChoiceField, NumberField } from "utils/fields";
import { doAction } from "utils/UIUtils";

/**
 * The popup to setup a show when first opening it in the editor.
 */
export default class SetupShowPopup extends BasePopup {
    /**
     * @param {string} name - The name of the show.
     * @param {string} slug - The slug of the show.
     */
    constructor(name, slug) {
        super();

        this._name = name;
        this._slug = slug;
    }

    get info() {
        return {
            name: 'setup-show',
            title: 'Set Up Show',
        };
    }

    getButtons() {
        let buttons = super.getButtons();

        // no cancel button
        _.pullAt(buttons, 1);

        return buttons;
    }

    getFields() {
        return [
            new NumberField("numDots", {
                label: "Number of dots",
                positive: true,
            }),
            new ChoiceField("dotFormat", DOT_FORMATS, {
                initial: "combo",
            }),
            new ChoiceField("fieldType", FIELD_TYPES, {
                initial: "college",
            }),
        ];
    }

    onSave(data) {
        let show = Show.create(this._name, this._slug, data);
        let controller = EditorController.init(show);
        controller.saveShow();
    }
}
