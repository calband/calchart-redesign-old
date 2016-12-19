var BaseContext = require("./BaseContext");
var JSUtils = require("../../utils/JSUtils");

/**
 * The default editor context, that allows a user to edit dot
 * continuities and step through marching
 */
var ContinuityContext = function(grapher) {
    BaseContext.call(this, grapher);
};

JSUtils.extends(ContinuityContext, BaseContext);

ContinuityContext.prototype.shortcuts = {
};

ContinuityContext.prototype.load = function() {
    var _this = this;
    
    $(".toolbar .edit-continuity").addClass("active");
};

ContinuityContext.prototype.unload = function() {
    this.removeEvents();
    $(".toolbar .edit-continuity").removeClass("active");
};

module.exports = ContinuityContext;
