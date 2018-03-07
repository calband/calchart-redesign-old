import ServerAction from "actions/ServerAction";

import { showMessage } from "utils/UIUtils";

/**
 * The action for saving a show to the server.
 */
export default class SaveShowAction extends ServerAction {
    /**
     * @param {EditorController} controller
     */
    constructor(controller) {
        super();
        this._controller = controller;
        // {jQuery}
        this._message = null;
    }

    static get action() {
        return "save_show";
    }

    send(data) {
        this._message = showMessage("Saving...", {
            autohide: false,
        });

        super.send(data);
    }

    handleSuccess(data) {
        this._message.text("Saved!").delayHide();
        this._controller.updateSavedShow(this._data.data);
    }
}
