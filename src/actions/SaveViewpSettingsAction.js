import ServerAction from "actions/ServerAction";

import { showError } from "utils/UIUtils";

export default class SaveViewpSettingsAction extends ServerAction {
    static get action() {
        return "save_settings";
    }

    handleError(xhr) {
        // error silently
        console.error(xhr);
    }
}
