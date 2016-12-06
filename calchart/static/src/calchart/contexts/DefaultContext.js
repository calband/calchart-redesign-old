var BaseContext = require("./BaseContext");
var JSUtils = require("../../utils/JSUtils");

/**
 * The default editor context, that allows a user to select dots with a rectangular
 * selection box, and also to drag and drop dots on the grid.
 */
var DefaultContext = function(grapher) {
    BaseContext.call(this, grapher);
};

JSUtils.extends(DefaultContext, BaseContext);

DefaultContext.prototype.shortcuts = {
};

DefaultContext.prototype.load = function() {
    // TODO
};

DefaultContext.prototype.unload = function() {
    // TODO
};

module.exports = DefaultContext;
