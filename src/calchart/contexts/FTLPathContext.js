import BaseContext from "calchart/contexts/BaseContext";

/**
 * The Context that allows a user to define the path in
 * a follow the leader continuity.
 */
export default class FTLPathContext extends BaseContext {
    constructor(controller) {
        super(controller);

        console.log("ftl path");
    }

    static get actions() {
        return ContextActions;
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {string} [dotType=null] - The dot type to initially load.
     */
    load(options) {
        // TODO
    }

    unload() {
        super.unload();

        this._controller.loadContext("continuity", {
            unload: false,
            // load dot type
        });
    }

    refresh() {
        // TODO
        super.refresh();
    }
}

class ContextActions {
    // TODO
}
