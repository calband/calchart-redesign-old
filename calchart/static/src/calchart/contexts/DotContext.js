/**
 * @fileOverview This file defines the DotContext class, the context
 * used to edit dot positions for a stuntsheet. Functions in this file
 * are organized alphabetically in the following sections:
 *
 * - Constructors (including loading/unloading functions)
 * - Instance methods
 * - Actions (methods that modify the Show)
 */

var BaseContext = require("./BaseContext");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
var MathUtils = require("utils/MathUtils");
var UIUtils = require("utils/UIUtils");

/**** CONSTRUCTORS ****/

/**
 * The default editor context, that allows a user to select dots with a rectangular
 * selection box, and also to drag and drop dots on the grid.
 */
var DotContext = function(controller) {
    BaseContext.call(this, controller);

    this._grapher = controller.getGrapher();

    // number of steps to snap dots to when dragging: null, 1, 2, 4
    this._grid = 2;

    // variables to track state when dragging dots
    this._scrollOffset = {};
    this._moveOffset = {};
};

JSUtils.extends(DotContext, BaseContext);

DotContext.prototype.load = function() {
    var _this = this;
    var svgOrigin = $("svg.graph").position();
    var scale = this._grapher.getScale();

    // variables to track state when dragging dots
    var dragState = "none"; // none, drag, select
    var dragStart = null;

    this._addEvents(".workspace", {
        contextmenu: function(e) {
            UIUtils.showContextMenu(e, {
                "Edit Continuity": "todo",
                "Change Dot Type": {
                    "Plain": "todo",
                    "Solid": "todo",
                    "Plain Forwardslash": "todo",
                    "Solid Forwardslash": "todo",
                    "Plain Backslash": "todo",
                    "Solid Backslash": "todo",
                    "Plain Cross": "todo",
                    "Solid Cross": "todo",
                },
            });
        },
        mousedown: function(e) {
            var target = $(e.target);

            if (target.is(".dot-marker")) {
                var dot = target.parent();

                if (e.shiftKey || e.ctrlKey || e.metaKey) {
                    _this._controller.toggleDots(dot);
                    this._dragState = "none";
                    return;
                }

                if (!_this._grapher.isSelected(dot)) {
                    _this._controller.selectDots(dot, {
                        append: false,
                    });
                }

                dragState = "drag";
                _this._scrollOffset.top = 0;
                _this._scrollOffset.left = 0;
                _this._moveOffset.x = 0;
                _this._moveOffset.y = 0;
            } else {
                _this._controller.deselectDots();
                HTMLBuilder.div("selection-box", null, "body");
                dragState = "select";
            }

            dragStart = e;
        },
    });

    this._addEvents(document, {
        mousemove: function(e) {
            if (dragState === "none") {
                return;
            }

            e.preventDefault();

            var deltaX = e.pageX - dragStart.pageX;
            var deltaY = e.pageY - dragStart.pageY;

            switch (dragState) {
                case "drag":
                    // snap deltaX and deltaY to grid; dots can themselves be off
                    // the grid, but they move in a consistent interval
                    var snap = scale.toDistance(_this._grid);
                    deltaX = MathUtils.round(_this._scrollOffset.left + deltaX, snap);
                    deltaY = MathUtils.round(_this._scrollOffset.top + deltaY, snap);
                    _this.moveSelection(deltaX, deltaY);
                    _this._moveOffset.x = deltaX;
                    _this._moveOffset.y = deltaY;
                    break;
                case "select":
                    // relative to page
                    var width = Math.abs(deltaX);
                    var height = Math.abs(deltaY);
                    var minX = Math.min(e.pageX, dragStart.pageX);
                    var minY = Math.min(e.pageY, dragStart.pageY);
                    var maxX = minX + width;
                    var maxY = minY + height;

                    // update dimensions of the selection box
                    $(".selection-box").css({
                        top: minY,
                        left: minX,
                        width: width,
                        height: height,
                    });

                    // relative to svgOrigin
                    minX -= svgOrigin.left;
                    minY -= svgOrigin.top;
                    maxX -= svgOrigin.left;
                    maxY -= svgOrigin.top;

                    // select dots within the selection box
                    _this._controller.deselectDots();
                    _this._grapher.getDots().each(function() {
                        var dot = $(this);
                        var position = dot.data("position");
                        if (
                            position.x >= minX &&
                            position.x <= maxX &&
                            position.y >= minY &&
                            position.y <= maxY
                        ) {
                            _this._controller.selectDots(dot);
                        }
                    });
            }
        },
        mouseup: function() {
            switch (dragState) {
                case "drag":
                    if (_this._moveOffset.x === 0 && _this._moveOffset.y === 0) {
                        break;
                    }
                    var deltaX = scale.toSteps(_this._moveOffset.x);
                    var deltaY = scale.toSteps(_this._moveOffset.y);
                    _this._controller.doAction("moveDots", [deltaX, deltaY]);
                    break;
                case "select":
                    $(".selection-box").remove();
                    break;
            }

            dragState = "none";
        },
    });

    $(".toolbar .edit-dots").addClass("active");
    $(".toolbar .edit-dots-group").removeClass("hide");
};

DotContext.prototype.unload = function() {
    this._removeEvents(document, ".workspace");
    this._controller.deselectDots();

    $(".toolbar .edit-dots").removeClass("active");
    $(".toolbar .edit-dots-group").addClass("hide");
};

/**** INSTANCE METHODS ****/

DotContext.prototype.shortcuts = {
    "ctrl+a": "selectAll",
    "left": "nudgeDots(-1, 0)",
    "up": "nudgeDots(0, -1)",
    "right": "nudgeDots(1, 0)",
    "down": "nudgeDots(0, 1)",
};

/**
 * Move all selected dots the given amount, from the dot's initial
 * position (i.e. from the position as stored in the Sheet)
 *
 * @param {float} deltaX -- the amount to move in the x direction, in pixels
 * @param {float} deltaY -- the amount to move in the y direction, in pixels
 */
DotContext.prototype.moveSelection = function(deltaX, deltaY) {
    var _this = this;
    var scale = this._grapher.getScale();

    this._controller.getSelection()
        .each(function() {
            var dotPosition = _this._sheet.getPosition($(this).data("dot"));
            var position = scale.toDistanceCoordinates(dotPosition);
            _this._grapher.moveDotTo(this, position.x + deltaX, position.y + deltaY);
        })
        .scrollIntoView(".workspace", {
            tolerance: 10,
            callback: function(deltaX, deltaY) {
                _this._scrollOffset.top += deltaY;
                _this._scrollOffset.left += deltaX;
            },
        });
};

/**
 * Nudge the selection of dots in the given direction.
 *
 * @param {int} deltaX -- the amount to move in the x direction, in steps
 * @param {int} deltaY -- the amount to move in the y direction, in steps
 */
DotContext.prototype.nudgeDots = function(deltaX, deltaY) {
    this._controller.doAction("moveDots", [deltaX, deltaY]);
};

/**** ACTIONS ****/

var ContextActions = {};

/**
 * Changes the currently selected dots' dot type to the given dot type
 *
 * @param {string} dotType -- the dot type to change to
 * @param {Sheet|undefined} sheet -- the sheet to change dot types for.
 *   Defaults to the current sheet
 */
ContextActions.changeDotType = function(dotType, sheet) {
    sheet = sheet || this._sheet;

    var selected = this._controller.getSelectedDots();
    var oldTypes = {};

    selected.forEach(function(dot) {
        var dotType = sheet.getDotType(dot);
        if (oldTypes[dotType] === undefined) {
            oldTypes[dotType] = [];
        }
        oldTypes[dotType].push(dot);
    });

    sheet.changeDotTypes(selected, dotType);
    this._controller.loadSheet(sheet);

    return {
        data: [dotType, sheet],
        undo: function() {
            $.each(oldTypes, function(dotType, dots) {
                sheet.changeDotTypes(dots, dotType);
            });
            this._controller.loadSheet(sheet);
        },
    };
};

/**
 * Move the given dots a given distance
 *
 * @param {float} deltaX -- the distance to move the dots in the
 *   x-direction, in steps
 * @param {float} deltaY -- the distance to move the dots in the
 *   y-direction, in steps
 * @param {Sheet|undefined} sheet -- the sheet to move dots for. Defaults
 *   to the currently loaded stunt sheet
 * @param {Array<Dot>|undefined} dots -- the dots to move. Defaults to the
 *   currently selected dots
 */
ContextActions.moveDots = function(deltaX, deltaY, sheet, dots) {
    sheet = sheet || this._sheet;
    dots = dots || this._controller.getSelectedDots();
    var prevPositions = {};

    // update positions

    dots.forEach(function(dot) {
        var position = sheet.getPosition(dot);
        // copy position
        prevPositions[dot.getLabel()] = $.extend({}, position);
        sheet.updatePosition(dot, position.x + deltaX, position.y + deltaY);
    });

    // update movements

    var controller = this._controller;
    var _updateMovements = function() {
        sheet.updateMovements(dots);
        controller.checkContinuities({
            dots: dots,
            sheet: sheet,
            quiet: true,
        });

        var prevSheet = sheet.getPrevSheet();
        if (prevSheet) {
            prevSheet.updateMovements(dots);
            controller.checkContinuities({
                dots: dots,
                sheet: prevSheet,
                quiet: true,
            });
        }
    };
    _updateMovements();

    // refresh
    controller.loadSheet(sheet);

    return {
        data: [deltaX, deltaY, sheet, dots],
        undo: function() {
            dots.forEach(function(dot) {
                var position = prevPositions[dot.getLabel()];
                sheet.updatePosition(dot, position.x, position.y);
            });
            _updateMovements();
            controller.loadSheet(sheet);
        },
    };
};

DotContext.prototype.actions = ContextActions;

module.exports = DotContext;
