import ServerAction from "actions/ServerAction";

import HTMLBuilder from "utils/HTMLBuilder";

export default class CreateShowAction extends ServerAction {
    /**
     * @param {jQuery} popup - The popup HTML element.
     */
    constructor(popup) {
        super();

        // {jQuery}
        this._popup = popup;
        this._buttons = popup.find(".buttons");
        this._message = HTMLBuilder.make("p", "Saving...");
    }

    static get action() {
        return "create_show";
    }

    send(data) {
        this._buttons.hide();
        this._message.appendTo(this._popup.find(".popup-box"));
        super.send(data);
    }

    handleError(xhr) {
        super.handleError(xhr);
        this._buttons.show();
        this._message.remove();
    }

    handleSuccess(data) {
        location.href = data.url;
    }
}
