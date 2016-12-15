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
    var dots = _this._grapher.getDots();
    var controller = window.controller;
    var origin = $("svg.graph").position();

    var dragState = "none"; // none, drag, select
    var dragStart = null; // event object on mousedown

    this.addEvents({
        mousedown: function(e) {
            var target = $(e.target);

            if (!target.closest(".workspace").exists()) {
                return;
            }

            if (target.is(".dot-marker")) {
                var dot = target.parent();
                controller.selectDot(dot, false);
                dragState = "drag";
            } else {
                controller.deselectDots();
                $("<div>")
                    .addClass("selection-box")
                    .appendTo("body");
                dragState = "select";
            }

            dragStart = e;
        },
        mousemove: function(e) {
            if (dragState === "none") {
                return;
            }

            e.preventDefault();

            var deltaX = e.pageX - dragStart.pageX;
            var deltaY = e.pageY - dragStart.pageY;

            switch (dragState) {
                case "drag":
                    // TODO: drag selected dots
                    break;
                case "select":
                    // relative to page
                    var width = Math.abs(deltaX);
                    var height = Math.abs(deltaY);
                    var minX = Math.min(e.pageX, dragStart.pageX);
                    var minY = Math.min(e.pageY, dragStart.pageY);
                    var maxX = minX + width;
                    var maxY = minY + height;

                    $(".selection-box").css({
                        top: minY,
                        left: minX,
                        width: width,
                        height: height,
                    });

                    // relative to origin
                    minX -= origin.left;
                    minY -= origin.top;
                    maxX -= origin.left;
                    maxY -= origin.top;

                    dots.each(function() {
                        var dot = $(this);
                        var position = dot.data("position");
                        if (
                            position.x >= minX &&
                            position.x <= maxX &&
                            position.y >= minY &&
                            position.y <= maxY
                        ) {
                            controller.selectDot(dot, true);
                        }
                    });

                    break;
            }
        },
        mouseup: function() {
            switch (dragState) {
                case "drag":
                    // TODO: save positions in controller (undo-able)
                    break;
                case "select":
                    $(".selection-box").remove();
                    break;
            }

            dragState = "none";
        },
    });
};

DefaultContext.prototype.unload = function() {
    this.removeEvents();
};

module.exports = DefaultContext;
