/**
 * @fileOverview This file defines the BaseContext class, the abstract
 * super class for contexts that define the actions that can be run in
 * the editor application when the context is loaded. Functions in this
 * file are organized alphabetically in the following sections:
 *
 * - Constructors (including loading/unloading functions)
 * - Instance methods
 * - Actions (methods that modify the Show)
 * - Helpers (prefixed with an underscore)
 */

var errors = require("calchart/errors");

/**** CONSTRUCTORS ****/

/**
 * Subclasses of this class define how the mouse cursor interacts with
 * the editor application.
 *
 * @param {EditorController} controller -- the Editor Controller
 */
var BaseContext = function(controller) {
    this._controller = controller;
    this._sheet = controller.getActiveSheet();

    if (!this._initialized[this.constructor.name]) {
        this._init();
        this._initialized[this.constructor.name] = true;
    }
};

// Maps BaseContext constructor names to whether they've been initialized yet
BaseContext.prototype._initialized = {};

/**
 * Runs any actions to initialize this context
 *
 * @param {object|undefined} options -- options to customize loading of the Context
 */
BaseContext.prototype.load = function(options) {
    throw new errors.NotImplementedError(this);
};

/**
 * Runs any necessary actions to unload the context
 */
BaseContext.prototype.unload = function() {
};

/**** INSTANCE METHODS ****/

// Shortcuts that the user can press to run actions in the EditorController
BaseContext.prototype.shortcuts = {};

/**
 * Refreshes the UI according to the state of the controller and context
 */
BaseContext.prototype.refresh = function() {
    this._sheet = this._controller.getActiveSheet();
};

/**** ACTIONS ****/

/**
 * Contains all actions in the context. Actions are any methods that modify the
 * Show and can be undone/redone. All actions must return an object containing:
 *   - {function} undo -- the function that will undo this action. `this` will be
 *     set to the context instance
 *   - {undefined|string} label -- optional label to use for the Undo/Redo menu item.
 *     Defaults to the name of the action, capitalized and spaced out
 *
 * Actions are also passed the context instance as `this`.
 */
BaseContext.prototype.actions = {};

/**** HELPERS ****/

/**
 * Add the given events to the given element
 *
 * @param {jQuery|string} element -- the element to add events to
 * @param {object} events -- the events to add, mapping event name to handler
 */
BaseContext.prototype._addEvents = function(element, events) {
    // namespace events
    $.each(events, function(name, handler) {
        events[name + ".app-context"] = handler;
        delete events[name];
    });

    $(element).on(events);
};

/**
 * Any actions to run when the context is initialized the first time.
 */
BaseContext.prototype._init = function() {
};

/**
 * Remove all namespaced events on the given elements. Usage:
 *
 * this._removeEvents(document, ".workspace");
 */
BaseContext.prototype._removeEvents = function() {
    $.each(arguments, function(i, element) {
        $(element).off(".app-context");
    });
};

module.exports = BaseContext;
