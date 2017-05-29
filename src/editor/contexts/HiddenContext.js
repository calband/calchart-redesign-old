import GraphContext from "editor/contexts/GraphContext";

import { NotImplementedError } from "utils/errors";

/**
 * A mixin for contexts hidden from the user; for example, when
 * editing a sheet's background image, users don't realize
 * that a new context, EditBackgroundContext, is being loaded.
 *
 * Usage:
 * class MyHiddenContext extends HiddenContextMixin(BaseContext) {
 *     ...
 * }
 *
 * @param {class} superclass - The superclass that the HiddenContextMixin
 *   should inherit from. The superclass needs to subclass GraphContext.
 * @return {class} The generated HiddenContext that can be extended.
 */
export function HiddenContextMixin(superclass) {
    class HiddenContext extends superclass {
        loadSheet(sheet) {
            if (sheet !== this.activeSheet) {
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
    return HiddenContext;
}

let HiddenGraphContext = HiddenContextMixin(GraphContext);
export default HiddenGraphContext;
