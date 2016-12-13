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
    var dots = this._grapher.getDots();
    if (dots.draggable("instance") !== undefined) {
        dots.draggable("enable");
    } else {
        var grapher = this._grapher;
        var twoSteps = this._grapher.getScale().toDistance(2);
        var options = {
            cursor: "none",
            containment: "svg.graph",
            grid: [twoSteps, twoSteps],
            drag: function(e, ui) {
                // TODO: still slightly off
                var deltaX = ui.position.left - $("svg.graph").position().left;
                var deltaY = ui.position.top - $("svg.graph").position().top;
                grapher.moveDot(this, deltaX, deltaY, true);
            },
            stop: function() {
                // TODO: update stuntsheet with EditorController action (undo-able)
            },
        };
        dots.each(function() {
            $(this).draggable(options);
        });
    }
};

DefaultContext.prototype.unload = function() {
    this._grapher.getDots().draggable("disable");
};

module.exports = DefaultContext;
