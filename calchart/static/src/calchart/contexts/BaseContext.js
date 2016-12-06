/**
 * Subclasses of this class define how the mouse cursor interacts with
 * the editor application.
 */
var BaseContext = function(grapher) {
    this._grapher = grapher;
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
 * Runs any necessary actions to unload the context
 */
BaseContext.prototype.unload = function() {
};

module.exports = BaseContext;
