import ContinuityContext from "calchart/contexts/ContinuityContext";
import DotContext from "calchart/contexts/DotContext";
import EditBackgroundContext from "calchart/contexts/EditBackgroundContext";
import FTLDotContext from "calchart/contexts/FTLDotContext";
import FTLPathContext from "calchart/contexts/FTLPathContext";

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
                case "ftl-dots":
                    contexts[name] = new FTLDotContext(controller);
                    break;
                case "ftl-path":
                    contexts[name] = new FTLPathContext(controller);
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
            EditBackgroundContext,
            ContinuityContext,
            DotContext,
            FTLDotContext,
            FTLPathContext,
        ];
        return _.extend({}, ... contexts.map(Context => {
            let shortcuts = {};
            _.each(Context.shortcuts, (cmd, action) => {
                // if action in the form func(args), parse out function name
                shortcuts[cmd] = action.match(/(\w+)(\(.+\))?/)[1];
            });
            return shortcuts;
        }));
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
        if (context instanceof FTLDotContext) {
            return "ftl-dots";
        }
        if (context instanceof FTLPathContext) {
            return "ftl-path";
        }
    }
}
