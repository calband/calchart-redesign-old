import CreateShowAction from "actions/CreateShowAction";
import FormPopup from "popups/FormPopup";

import { IS_STUNT } from "utils/env";
import { BooleanField, CharField } from "utils/fields";

/**
 * The popup to create a show.
 */
export default class CreateShowPopup extends FormPopup {
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
        ];

        if (!IS_STUNT) {
            _.pullAt(fields, 1);
        }

        return fields;
    }

    onSave(data) {
        new CreateShowAction(this._popup).send({
            name: data.name,
            is_band: data.isBand,
        });
        return false;
    }
}
