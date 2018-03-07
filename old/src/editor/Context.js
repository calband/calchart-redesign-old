import ContinuityContext from "editor/contexts/ContinuityContext";
import ContinuityDotContext from "editor/contexts/ContinuityDotContext";
import DotContext from "editor/contexts/DotContext";
import EditBackgroundContext from "editor/contexts/EditBackgroundContext";
import FTLPathContext from "editor/contexts/FTLPathContext";
import GateReferenceContext from "editor/contexts/GateReferenceContext";
import MusicContext from "editor/contexts/MusicContext";
import TwoStepContext from "editor/contexts/TwoStepContext";

let ALL_CONTEXTS = [
    DotContext, // put first so that GraphContext initializes correctly
    ContinuityContext,
    ContinuityDotContext,
    EditBackgroundContext,
    FTLPathContext,
    GateReferenceContext,
    MusicContext,
    TwoStepContext,
];

/**
 * A proxy class for knowing and loading all Context types, although all Context
 * types actually inherit from {@link BaseContext}. This proxy class allows for
 * ease of abstraction and prevents circular dependencies.
 */
export default class Context {
    /**
     * Initializes all the contexts when the editor is loaded.
     *
     * @param {EditorController} controller
     */
    static init(controller) {
        this.contexts = {};

        ALL_CONTEXTS.forEach(_Context => {
            let context = new _Context(controller);
            this.contexts[context.name] = context;
        });
    }

    /**
     * Load a Context into the editor application.
     *
     * @param {string} name - The name of the context to load.
     * @param {EditorController} controller
     * @param {Object} [options] - Any options to pass to the context.
     * @return {Context}
     */
    static load(name, controller, options={}) {
        let context = this.contexts[name];

        if (context) {
            context.load(options);
            return context;
        } else {
            throw new Error(`No context named: ${name}`);
        }
    }

    /**
     * @return {Object.<string, string>} an object mapping shortcut action (e.g.
     *   "saveShow") to shortcut command (e.g. "ctrl+s").
     */
    static getAllShortcutCommands() {
        return _.extend({}, ... ALL_CONTEXTS.map(
            Context => _.invert(Context.shortcuts)
        ));
    }
}
