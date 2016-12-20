var BaseContext = require("./BaseContext");
var JSUtils = require("../../utils/JSUtils");
var UIUtils = require("../../utils/UIUtils");

/**
 * The default editor context, that allows a user to edit dot
 * continuities and step through marching
 */
var ContinuityContext = function(grapher, sheet) {
    BaseContext.call(this, grapher, sheet);

    this._panel = $(".panel.edit-continuity");
};

JSUtils.extends(ContinuityContext, BaseContext);

ContinuityContext.prototype.shortcuts = {
};

ContinuityContext.prototype.load = function() {
    var _this = this;

    UIUtils.setupPanel(this._panel, {
        bottom: 20,
        right: 20,
        onInit: function(panel) {
            // TODO: panel actions
        },
    });
    this._panel.show();
    
    $(".toolbar .edit-continuity").addClass("active");
};

ContinuityContext.prototype.unload = function() {
    this._panel.hide();
    // this.removeEvents();

    $(".toolbar .edit-continuity").removeClass("active");
};

module.exports = ContinuityContext;
