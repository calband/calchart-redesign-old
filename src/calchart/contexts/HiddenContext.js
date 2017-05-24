import GraphContext from "calchart/contexts/GraphContext";

import { NotImplementedError } from "utils/errors";

/**
 * A superclass for contexts hidden from the user; for example,
 * when editing a sheet's background image, users don't realize
 * that a new context, EditBackgroundContext, is being loaded.
 */
export default class HiddenContext extends GraphContext {
    loadSheet(sheet) {
        if (sheet !== this._sheet) {
            this.exit();
        } else {
            super.loadSheet(sheet);
        }
    }

    /**
     * Exits this context to the previous context.
     */
    exit() {
        throw new NotImplementedError(this);
    }
}
