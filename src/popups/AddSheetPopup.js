import BasePopup from "popups/BasePopup";

import { NumberField } from "utils/fields";

/**
 * The popup to add a sheet.
 */
export default class AddSheetPopup extends BasePopup {
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
                positive: true,
            }),
        ];
    }

    onSave(data) {
        this._controller.doAction("addSheet", [data.numBeats]);
    }
}
