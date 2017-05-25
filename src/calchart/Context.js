import ContinuityContext from "calchart/contexts/ContinuityContext";
import ContinuityDotContext from "calchart/contexts/ContinuityDotContext";
import DotContext from "calchart/contexts/DotContext";
import EditBackgroundContext from "calchart/contexts/EditBackgroundContext";
import FTLPathContext from "calchart/contexts/FTLPathContext";
import GateReferenceContext from "calchart/contexts/GateReferenceContext";
import MusicContext from "calchart/contexts/MusicContext";
import TwoStepContext from "calchart/contexts/TwoStepContext";

let ALL_CONTEXTS = [
    ContinuityContext,
    ContinuityDotContext,
    DotContext,
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
            this.contexts[context.info.name] = context;
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
