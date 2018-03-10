import ServerAction from "actions/ServerAction";

export default class UploadAudioAction extends ServerAction {
    /**
     * @param {MusicContext} context
     */
    constructor(context) {
        super();

        this._controller = context.controller;
    }

    static get action() {
        return "upload_audio";
    }

    handleSuccess(data) {
        this._controller.doAction("setAudioUrl", [data.url]);
    }
}
