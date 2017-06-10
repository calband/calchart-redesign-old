import ServerAction from "actions/ServerAction";

export default class SaveViewpSettingsAction extends ServerAction {
    static get action() {
        return "save_settings";
    }

    handleError(xhr) {
        // error silently
        console.error(xhr);
    }
}
