import FormPopup from "popups/FormPopup";

import { NumberField } from "utils/fields";

/**
 * The popup to add a sheet.
 */
export default class AddSheetPopup extends FormPopup {
    /**
     * @param {EditorController} controller
     */
    constructor(controller) {
        super();

        this._controller = controller;
    }

    get info() {
        return {
            name: "add-sheet",
        };
    }

    getFields() {
        return [
            new NumberField("numBeats", {
                label: "Number of beats",
                positive: true,
            }),
        ];
    }

    onSave(data) {
        this._controller.doAction("addSheet", [data.numBeats]);
    }
}
