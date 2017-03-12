import * as _ from "lodash";

import { NotImplementedError } from "utils/errors";

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
        this._grapher = controller.getGrapher();
        this._sheet = controller.getActiveSheet();
        this._eventListeners = new Set();
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
     * @param {object} options - Options to customize loading the Context.
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
     * Refresh the UI after zooming.
     */
    refreshZoom() {
    }

    /**
     * @return {EditorController}
     */
    getController() {
        return this._controller;
    }

    /**
     * Add the given events to the given element. Can either give as two parameters as
     * described below, or three parameters, where the second parameter is the event
     * name and the third parameter is the event handler.
     *
     * @param {jQuery|string} element - The jQuery selector or element to add events to.
     * @param {Object.<string, function(Event)>} events - The events to add, mapping event
     *   name to handler.
     */
    _addEvents(element, events) {
        if (arguments.length === 3) {
            let name = arguments[1];
            events = {
                [name]: arguments[2],
            };
        }

        // namespace events
        events = _.mapKeys(events, (handler, name) => `${name}.app-context`);

        $(element).on(events);
        this._eventListeners.add(element);
    }
}
