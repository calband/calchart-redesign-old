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

module.exports = BaseContext;
