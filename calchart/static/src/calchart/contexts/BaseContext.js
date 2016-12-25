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

// Shortcuts that the user can press to run actions in the EditorController
BaseContext.prototype.shortcuts = {};

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
 * Runs any necessary actions to unload the context
 */
BaseContext.prototype.unload = function() {
};

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
