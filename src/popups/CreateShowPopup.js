import BasePopup from "popups/BasePopup";

import { BooleanField, CharField, FileField } from "utils/fields";
import HTMLBuilder from "utils/HTMLBuilder";
import { doAction, showError } from "utils/UIUtils";

/**
 * The popup to create a show.
 */
export default class CreateShowPopup extends BasePopup {
    /**
     * @param {boolean} isStunt - True if the current user is on Stunt.
     */
    constructor(isStunt) {
        super();

        this._isStunt = isStunt;
    }

    get info() {
        return {
            name: "create-show",
        };
    }

    getFields() {
        let fields = [
            new CharField("name"),
            new BooleanField("isBand", {
                label: "For Cal Band",
            }),
            new FileField("audio", {
                label: "Audio file (opt.)",
                extensions: ["ogg"],
                required: false,
            }),
        ];

        if (!this._isStunt) {
            _.pullAt(fields, 1);
        }

        return fields;
    }

    onSave(data) {
        let params = {
            show_name: data.name,
            audio: data.audio,
            isBand: data.isBand,
        };

        let buttons = this._popup.find(".buttons").hide();
        let message = HTMLBuilder.make("p", "Saving...")
            .appendTo(this._popup.find(".popup-box"));

        doAction("create_show", params, {
            dataType: "json",
            success: data => {
                location.href = data.url;
            },
            error: xhr => {
                showError(xhr.responseJSON.message);
                buttons.show();
                message.remove();
            },
        });

        return false;
    }
}
