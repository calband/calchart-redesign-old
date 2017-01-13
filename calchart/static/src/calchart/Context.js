import * as _ from "lodash";

import ContinuityContext from "calchart/contexts/ContinuityContext";
import DotContext from "calchart/contexts/DotContext";

/**
 * A proxy class for knowing and loading all Context types, although all Context
 * types actually inherit from {@link BaseContext}. This proxy class allows for
 * ease of abstraction and prevents circular dependencies.
 */
export default class Context {
    /**
     * Load a Context into the editor application.
     *
     * @param {string} name - The name of the context to load.
     * @param {EditorController} controller
     * @param {Object} [options] - Any options to pass to the context.
     * @return {Context}
     */
    static load(name, controller, options) {
        let context;
        switch (name) {
            case "continuity":
                context = new ContinuityContext(controller);
                break;
            case "dot":
                context = new DotContext(controller);
                break;
            default:
                throw new Error(`No context named: ${name}`);
        }
        context.load(options);
        return context;
    }

    /**
     * @return {Object.<string, string>} an object mapping shortcut action (e.g.
     *   "saveShow") to shortcut command (e.g. "ctrl+s").
     */
    static getAllShortcutCommands() {
        let contexts = [
            ContinuityContext,
            DotContext,
        ];
        return _.extend({}, ... contexts.map(
            Context => _.invert(Context.shortcuts)
        ));
    }
}
    