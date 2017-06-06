import FormPopup from "popups/FormPopup";

import { VIEWPSHEET_ORIENTATIONS } from "utils/CalchartUtils";
import { ChoiceField } from "utils/fields";
import HTMLBuilder from "utils/HTMLBuilder";
import { update } from "utils/JSUtils";

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
        let dotIds = this._settings.dots.map(dot => dot.id);

        return [
            new ChoiceField("pathOrientation", VIEWPSHEET_ORIENTATIONS, {
                label: "Individual path orientation",
                initial: this._settings.pathOrientation,
            }),
            new ChoiceField("nearbyOrientation", VIEWPSHEET_ORIENTATIONS, {
                label: "Nearby dots orientation",
                initial: this._settings.pathOrientation,
            }),
            new ChoiceField("birdsEyeOrientation", VIEWPSHEET_ORIENTATIONS, {
                label: "Birds eye orientation",
                initial: this._settings.pathOrientation,
            }),
            new ChoiceField("layoutLeftRight", layoutLeftRight, {
                label: "Layout order",
                initial: this._settings.layoutLeftRight,
            }),
            new ChoiceField("dots", allDots, {
                initial: this._settings.dots.map(dot => dot.id),
                multiple: true,
            }),
        ];
    }

    onSave(data) {
        data.layoutLeftRight = data.layoutLeftRight === "leftRight";
        let show = this._controller.show;
        data.dots = data.dots.map(id => show.getDot(id));

        update(this._settings, data);
        this._controller.generate();
    }
}
