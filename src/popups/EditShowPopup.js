import BasePopup from "popups/BasePopup";

import {
    SHOW_FIELD_TYPES,
    SHOW_STEP_TYPES,
    SHOW_ORIENTATIONS,
} from "utils/CalchartUtils";
import { IS_STUNT } from "utils/env";
import { BooleanField, ChoiceField, NumberField } from "utils/fields";

/**
 * The popup to edit a show.
 */
export default class EditShowPopup extends BasePopup {
    /**
     * @param {EditorController} controller
     */
    constructor(controller) {
        super();

        this._controller = controller;
    }

    get info() {
        return {
            name: "edit-show",
            title: "Show Properties",
        };
    }

    getFields() {
        let show = this._controller.show;

        let fields = [
            new BooleanField("isBand", {
                label: "For Cal Band",
                initial: show.isForBand(),
            }),
            new ChoiceField("fieldType", SHOW_FIELD_TYPES, {
                initial: show.getFieldType(),
            }),
            new NumberField("beatsPerStep", {
                initial: show.getBeatsPerStep(),
                positive: true,
            }),
            new ChoiceField("stepType", SHOW_STEP_TYPES, {
                initial: show.getStepType(),
            }),
            new ChoiceField("orientation", SHOW_ORIENTATIONS, {
                initial: show.getOrientation(),
            }),
        ];

        if (!IS_STUNT) {
            _.pullAt(fields, 0);
        }

        return fields;
    }

    onSave(data) {
        this._controller.doAction("saveShowProperties", [data]);
    }
}
