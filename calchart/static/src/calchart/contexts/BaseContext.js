import { NotImplementedError } from "utils/errors";

// Maps Context constructor names to whether they've been initialized yet
let initializedContexts = {};

/**
 * Represents a Context that defines a state of the editor application and
 * the actions that can be run when the editor application is in the
 * given state.
 */
export default class BaseContext {
    /**
     * @param {EditorController} controller
     */
    constructor(controller) {
        this._controller = controller;
        this._sheet = controller.getActiveSheet();
        this._eventListeners = new Set();

        if (!initializedContexts[this.constructor.name]) {
            this._init();
            initializedContexts[this.constructor.name] = true;
        }
    }

    /**
     * Shortcuts that the user can press to run actions in the EditorController.
     *
     * @return {Object.<string, string>}
     */
    static get shortcuts() {
        return {};
    }

    get shortcuts() { return this.constructor.shortcuts; }

    /**
     * All actions in the context. Actions are any methods that modify the Show and
     * can be undone/redone. All actions must return an object containing:
     *   - {function(this:Context)} undo - The function that will undo this action.
     *   - {string} [label] -- optional label to use for the Undo/Redo menu item.
     *     Defaults to the name of the action, capitalized and spaced out.
     *
     * @return {function} A class that defines static functions that run undoable
     *   actions on the controller/context. Functions have `this` defined as the
     *   Context instance.
     */
    static get actions() {
        return {};
    }

    get actions() { return this.constructor.actions; }

    /**
     * Runs any actions to load this context in the editor application.
     *
     * @param {object} [options] - Options to customize loading the Context.
     */
    load(options) {
        throw new NotImplementedError(this);
    }

    /**
     * Runs any necessary actions to unload the context. Defaults to removing all events
     * set by _addEvents.
     */
    unload() {
        for (let element of this._eventListeners) {
            $(element).off(".app-context");
        }
    }

    /**
     * Refresh the UI according to the state of the controller and context.
     */
    refresh() {
        this._sheet = this._controller.getActiveSheet();
    }

    /**
     * Add the given events to the given element
     *
     * @param {jQuery|string} element - The jQuery selector or element to add events to.
     * @param {Object.<string, function(Event)>} events - The events to add, mapping event
     *   name to handler.
     */
    _addEvents(element, events) {
        // namespace events
        $.each(events, function(name, handler) {
            events[name + ".app-context"] = handler;
            delete events[name];
        });

        $(element).on(events);
        this._eventListeners.add(element);
    }

    /**
     * Any actions to run when the context is initialized the first time.
     */
    _init() {}
}
