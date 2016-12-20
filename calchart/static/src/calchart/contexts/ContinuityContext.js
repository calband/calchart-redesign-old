var BaseContext = require("./BaseContext");
var JSUtils = require("../../utils/JSUtils");
var UIUtils = require("../../utils/UIUtils");

/**
 * The default editor context, that allows a user to edit dot
 * continuities and step through marching
 */
var ContinuityContext = function(grapher, sheet) {
    BaseContext.call(this, grapher, sheet);

    this._panel = null;
};

JSUtils.extends(ContinuityContext, BaseContext);

ContinuityContext.prototype.shortcuts = {
};

ContinuityContext.prototype.load = function() {
    var _this = this;
    this._createPanel();
    
    $(".toolbar .edit-continuity").addClass("active");
};

ContinuityContext.prototype.unload = function() {
    this._panel.remove();
    this.removeEvents();
    $(".toolbar .edit-continuity").removeClass("active");
};

/**** HELPERS ****/

/**
 * Creates the continuity editor panel.
 */
ContinuityContext.prototype._createPanel = function() {
    var contents = $("<div>").text("HI");

    var panel = UIUtils.createPanel(contents, {
        bottom: 20,
        right: 20,
    });

    var isDrag = false;
    var offset = null;

    panel.find(".panel-handle").on({
        mousedown: function(e) {
            isDrag = true;
            var _offset = $(this).offset();
            offset = {
                top: _offset.top - e.pageY,
                left: _offset.left - e.pageX,
            };
        },
        mouseup: function() {
            isDrag = false;
        },
    });

    this.addGlobalEvents({
        mousemove: function(e) {
            if (!isDrag) {
                return;
            }

            e.preventDefault();
            panel.css({
                top: e.pageY + offset.top,
                left: e.pageX + offset.left,
                bottom: "",
                right: "",
            });
        },
    });

    this._panel = panel;
};

module.exports = ContinuityContext;
