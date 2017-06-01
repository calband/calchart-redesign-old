import BasePopup from "popups/BasePopup";

import { DEFAULT_CUSTOM, FIELD_TYPES, ORIENTATIONS, STEP_TYPES } from "utils/CalchartUtils";
import { CharField, ChoiceField, ChoiceOrNumberField } from "utils/fields";

/**
 * The popup to add a song.
 */
export default class EditSongPopup extends BasePopup {
    /**
     * @param {EditorController} controller
     * @param {Song} song
     */
    constructor(controller, song) {
        super();

        this._controller = controller;
        this._song = song;
    }

    get info() {
        return {
            name: "edit-song",
        };
    }

    getFields() {
        return [
            new CharField("name", {
                initial: this._song.getName(),
            }),
            new ChoiceField("fieldType", FIELD_TYPES, {
                initial: this._song.fieldType,
            }),
            new ChoiceOrNumberField("beatsPerStep", DEFAULT_CUSTOM, {
                initial: {
                    choice: this._song.beatsPerStep === "default" ? "default" : "custom",
                    number: this._song.getBeatsPerStep(),
                },
                positive: true,
            }),
            new ChoiceField("stepType", STEP_TYPES, {
                initial: this._song.stepType,
            }),
            new ChoiceField("orientation", ORIENTATIONS, {
                initial: this._song.orientation,
            }),
        ];
    }

    onSave(data) {
        this._controller.doAction("saveSong", [this._song, data]);
    }
}
