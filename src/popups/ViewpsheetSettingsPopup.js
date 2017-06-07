import FormPopup from "popups/FormPopup";

import { ChoiceField } from "utils/fields";
import { ORIENTATIONS } from "utils/ViewpsheetUtils";

/**
 * The popup to change the settings for generating viewpsheets.
 */
export default class ViewpsheetSettingsPopup extends FormPopup {
    /**
     * @param {ViewerController} controller
     */
    constructor(controller) {
        super();

        this._controller = controller;
        this._settings = controller.getSettings();
    }

    get info() {
        return {
            name: "viewpsheet-settings",
        };
    }

    getFields() {
        let layoutLeftRight = {
            leftRight: "Left to right",
            topBottom: "Top to bottom",
        };
        let allDots = {};
        this._controller.show.getDots().forEach(dot => {
            allDots[dot.id] = dot.label;
        });

        return [
            new ChoiceField("pathOrientation", ORIENTATIONS, {
                label: "Individual path orientation",
                initial: this._settings.pathOrientation,
            }),
            new ChoiceField("nearbyOrientation", ORIENTATIONS, {
                label: "Nearby dots orientation",
                initial: this._settings.nearbyOrientation,
            }),
            new ChoiceField("birdsEyeOrientation", ORIENTATIONS, {
                label: "Birds eye orientation",
                initial: this._settings.birdsEyeOrientation,
            }),
            new ChoiceField("layoutLeftRight", layoutLeftRight, {
                label: "Layout order",
                initial: this._settings.layoutLeftRight ? "leftRight" : "topBottom",
            }),
            new ChoiceField("dots", allDots, {
                initial: this._controller.getDots().map(dot => dot.id),
                multiple: true,
                dropdown: {
                    placeholder_text_multiple: "Select some dots...",
                },
            }),
        ];
    }

    onSave(data) {
        data.layoutLeftRight = data.layoutLeftRight === "leftRight";
        this._controller.saveSettings(data);
    }
}
