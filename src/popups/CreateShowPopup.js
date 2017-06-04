import CreateShowAction from "actions/CreateShowAction";
import BasePopup from "popups/BasePopup";

import { IS_STUNT } from "utils/env";
import { BooleanField, CharField, FileField } from "utils/fields";

/**
 * The popup to create a show.
 */
export default class CreateShowPopup extends BasePopup {
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

        if (!IS_STUNT) {
            _.pullAt(fields, 1);
        }

        return fields;
    }

    onSave(data) {
        new CreateShowAction(this._popup).send({
            name: data.name,
            audio: data.audio,
            is_band: data.isBand,
        });
        return false;
    }
}
