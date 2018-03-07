import { NotImplementedError } from "utils/errors";

/**
 * Represents a Context that defines a state of the editor application and
 * the actions that can be run when the editor application is in the
 * given state.
 *
 * Method handlers:
 * - When the editor is initialized, the constructor is called.
 * - Every time the user loads the context, load() is called, then refresh().
 * - Every time the user loads another context, unload() is called before
 *   loading the next context.
 */
export default class BaseContext {
    /**
     * @param {EditorController} controller
     */
    constructor(controller) {
        this._controller = controller;
        this._eventListeners = [];

        if (this.panel) {
            this._panel = new this.panel(this);
        } else {
            this._panel = null;
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

    /**
     * All actions in the context. Actions are any methods that modify the Show and
     * can be undone/redone. See EditorController.actions for more details.
     *
     * @return {function} A class that defines static functions that run undoable
     *   actions on the controller/context. Functions have `this` defined as the
     *   Context instance.
     */
    static get actions() {
        return {};
    }

    /**
     * @return {string} name - The name of the context, the string used for
     *   Context.load and other areas of the code that need to uniquely identify
     *   this context.
     */
    static get name() {
        throw new NotImplementedError(this);
    }

    /**
     * @return {string[]} Targets to use when refresh("all") is called.
     */
    static get refreshTargets() {
        return ["panel"];
    }

    get controller() {
        return this._controller;
    }

    get name() {
        return this.constructor.name;
    }

    /**
     * @return {?BasePanel} The panel to display for this context.
     */
    get panel() {
        return null;
    }

    get show() {
        return this.controller.show;
    }

    /**
     * Runs any actions to load this context in the editor application.
     *
     * @param {object} options - Options to customize loading the Context.
     */
    load(options) {
        $(`.toolbar .${this.name}`).addClass("active");
        $(`.menu-item.${this.name}-context`).removeClass("disabled");
        $(`.toolbar ul.${this.name}-context`).removeClass("hide");

        if (this._panel) {
            this._panel.show();
        }
    }

    /**
     * Refresh the UI according to the state of the context.
     *
     * @param {...String} [targets] - The elements to refresh. When refresh() is called with
     *   one of the names in the list, refresh<target>() will be called. For example,
     *   refresh("foo") will call refreshFoo(). Passing in no targets or passing in "all" will
     *   include all the targets in refreshTargets.
     */
    refresh(...targets) {
        if (targets.length === 0 || _.includes(targets, "all")) {
            let index = targets.indexOf("all");
            targets.splice(index, 1, ...this.constructor.refreshTargets);
        }

        targets.forEach(target => {
            target = _.capitalize(target);
            this[`refresh${target}`]();
        });
    }

    /**
     * Refresh the panel.
     */
    refreshPanel() {
        if (this._panel) {
            this._panel.refresh();
        }
    }

    /**
     * Runs any necessary actions to unload the context. Defaults to removing all events
     * set by _addEvents.
     */
    unload() {
        this._eventListeners.forEach(event => {
            $(event.element).off(".app-context", event.selector);
        });

        $(`.toolbar .${this.name}`).removeClass("active");
        $(`li.menu-item.${this.name}-context`).addClass("disabled");
        $(`.toolbar ul.${this.name}-context`).addClass("hide");

        if (this._panel) {
            this._panel.hide();
        }
    }

    /**** HELPERS ****/

    /**
     * Add the given events to the given element.
     *
     * @param {jQuery|string} element - The jQuery selector or element to add events to.
     * @param {string} [selector] - An optional selector string to filter the descendants
     *   of the selected elements that trigger the event (see jQuery's .on function).
     * @param {Object.<string, function(Event)>} events - The events to add, mapping event
     *   name to handler.
     */
    _addEvents(element, selector, events) {
        if (arguments.length === 2) {
            element = arguments[0];
            selector = null;
            events = arguments[1];
        }

        // namespace events
        events = _.mapKeys(events, (handler, name) => `${name}.app-context`);

        $(element).on(events, selector);
        this._eventListeners.push({ element, selector });
    }
}
