import FormPopup from "popups/FormPopup";

import { CharField } from "utils/fields";

/**
 * The popup to add a song.
 */
export default class AddSongPopup extends FormPopup {
    /**
     * @param {EditorController} controller
     */
    constructor(controller) {
        super();

        this._controller = controller;
    }

    get info() {
        return {
            name: "add-song",
        };
    }

    getFields() {
        return [
            new CharField("name"),
        ];
    }

    onSave(data) {
        this._controller.doAction("addSong", [data.name]);
    }
}
