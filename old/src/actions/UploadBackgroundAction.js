import ServerAction from "actions/ServerAction";

export default class UploadBackgroundAction extends ServerAction {
    /**
     * @param {EditSheetPopup} popup
     * @param {GraphContext} context
     */
    constructor(popup, context) {
        super();

        this._popup = popup;
        this._context = context;
    }

    static get action() {
        return "upload_sheet_image";
    }

    handleSuccess(data) {
        this._context.activeSheet.setBackground(data.url);
        this._popup.updateBackgroundInfo();
    }
}
