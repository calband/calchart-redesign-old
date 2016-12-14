var BaseContext = require("./BaseContext");
var JSUtils = require("../../utils/JSUtils");

/**
 * The default editor context, that allows a user to select dots with a rectangular
 * selection box, and also to drag and drop dots on the grid.
 */
var DefaultContext = function(grapher) {
    BaseContext.call(this, grapher);

    // number of steps to snap dots to when dragging: null, 1, 2, 4
    this._grid = 2;
};

JSUtils.extends(DefaultContext, BaseContext);

DefaultContext.prototype.shortcuts = {
};

DefaultContext.prototype.load = function() {
    var _this = this;
    var dots = this._grapher.getDots();

    if (dots.draggable("instance") !== undefined) {
        dots.draggable("enable");
    } else {
        var options = {
            containment: "svg.graph",
            handle: ".dot-marker",
            drag: function(e, ui) {
                var origin = $("svg.graph").position();
                var deltaX = e.clientX - origin.left;
                var deltaY = e.clientY - origin.top;
                _this._grapher.moveDot(this, deltaX, deltaY, {
                    snap: _this._grid,
                });
            },
            start: function() {
                $(".content .workspace").css("cursor", "none");
            },
            stop: function() {
                $(".content .workspace").css("cursor", "");
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
