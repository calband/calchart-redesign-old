/**
 * Subclasses of this class define how the mouse cursor interacts with
 * the editor application.
 *
 * @param {BaseGrapher} grapher -- the grapher for the field
 * @param {Sheet} sheet -- the currently active Sheet
 */
var BaseContext = function(grapher, sheet) {
    this._grapher = grapher;
    this._sheet = sheet;
};

/**
 * Shortcuts that the user can press to run actions in the EditorController
 */
BaseContext.prototype.shortcuts = {};

/**
 * Add the given events to the workspace
 *
 * @param {object} events -- the events to add, mapping event name to handler
 */
BaseContext.prototype.addEvents = function(events) {
    this._namespaceEvents(events);
    $(".workspace").on(events);
};

/**
 * Add the given events to the context
 *
 * @param {object} events -- the events to add, mapping event name to handler
 */
BaseContext.prototype.addGlobalEvents = function(events) {
    this._namespaceEvents(events);
    $(document).on(events);
};

/**
 * Runs any actions to initialize this context
 */
BaseContext.prototype.load = function() {
    throw new Error(this.constructor.name + " did not define load");
};

/**
 * Updates the active sheet
 *
 * @param {Sheet} sheet -- the sheet to load
 */
BaseContext.prototype.loadSheet = function(sheet) {
    this._sheet = sheet;
};

/**
 * Remove all events from the .workspace element
 */
BaseContext.prototype.removeEvents = function() {
    $(document).off(".app-context");
    $(".workspace").off(".app-context");
};

/**
 * Runs any necessary actions to unload the context
 */
BaseContext.prototype.unload = function() {
};

/**** HELPERS ****/

/**
 * Adds the app-context namespace to the list of events
 *
 * @param {object} events -- the events to add namespaces to
 */
BaseContext.prototype._namespaceEvents = function(events) {
    $.each(events, function(name, handler) {
        events[name + ".app-context"] = handler;
        delete events[name];
    });
};

module.exports = BaseContext;
