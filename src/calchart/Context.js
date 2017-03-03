import * as _ from "lodash";

import ContinuityContext from "calchart/contexts/ContinuityContext";
import DotContext from "calchart/contexts/DotContext";
import EditBackgroundContext from "calchart/contexts/EditBackgroundContext";

// cache contexts after they've been created
let contexts = {};

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
    static load(name, controller, options={}) {
        if (_.isUndefined(contexts[name])) {
            switch (name) {
                case "background":
                    contexts[name] = new EditBackgroundContext(controller);
                    break;
                case "continuity":
                    contexts[name] = new ContinuityContext(controller);
                    break;
                case "dot":
                    contexts[name] = new DotContext(controller);
                    break;
                default:
                    throw new Error(`No context named: ${name}`);
            }
        }

        let context = contexts[name];
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

    /**
     * Give the name of the given Context.
     *
     * @param {Context} context - The context to name.
     * @return {string}
     */
    static name(context) {
        if (context instanceof EditBackgroundContext) {
            return "background";
        }
        if (context instanceof ContinuityContext) {
            return "continuity";
        }
        if (context instanceof DotContext) {
            return "dot";
        }
    }
}
    