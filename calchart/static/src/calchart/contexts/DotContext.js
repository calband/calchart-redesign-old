var BaseContext = require("./BaseContext");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
var MathUtils = require("utils/MathUtils");

// Global variable to track how much the workspace has scrolled
// when moving the dots
var scrollOffset = {
    top: 0,
    left: 0,
};

/**
 * The default editor context, that allows a user to select dots with a rectangular
 * selection box, and also to drag and drop dots on the grid.
 */
var DotContext = function(controller) {
    BaseContext.call(this, controller);

    this._grapher = controller.getGrapher();

    // dots selected to edit
    this._selectedDots = $();

    // number of steps to snap dots to when dragging: null, 1, 2, 4
    this._grid = 2;
};

JSUtils.extends(DotContext, BaseContext);

DotContext.prototype.shortcuts = {
    "ctrl+a": "selectAll",
    "left": "nudgeDots(-1, 0)",
    "up": "nudgeDots(0, -1)",
    "right": "nudgeDots(1, 0)",
    "down": "nudgeDots(0, 1)",
};

DotContext.prototype.load = function() {
    var _this = this;
    var svgOrigin = $("svg.graph").position();
    var scale = this._grapher.getScale();

    var dragState = "none"; // none, drag, select
    var dragStart = null; // event object on mousedown

    this._addEvents(".workspace", {
        contextmenu: function(e) {
            e.preventDefault();

            // TODO: custom context menu
        },
        mousedown: function(e) {
            var target = $(e.target);

            if (target.is(".dot-marker")) {
                var dot = target.parent();

                if (e.shiftKey || e.ctrlKey || e.metaKey) {
                    _this.toggleDots(dot);
                } else if (!_this._selectedDots.filter(dot).exists()) {
                    _this.selectDots(dot, {
                        append: false,
                    });
                }

                dragState = "drag";
            } else {
                _this.deselectDots();
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
                    deltaX = MathUtils.round(deltaX, snap);
                    deltaY = MathUtils.round(deltaY, snap);
                    _this.moveSelection(deltaX, deltaY);
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

                    // relative to svgOrigin
                    minX -= svgOrigin.left;
                    minY -= svgOrigin.top;
                    maxX -= svgOrigin.left;
                    maxY -= svgOrigin.top;

                    _this.deselectDots();
                    _this._grapher.getDots().each(function() {
                        var dot = $(this);
                        var position = dot.data("position");
                        if (
                            position.x >= minX &&
                            position.x <= maxX &&
                            position.y >= minY &&
                            position.y <= maxY
                        ) {
                            _this.selectDots(dot);
                        }
                    });

                    break;
            }
        },
        mouseup: function() {
            switch (dragState) {
                case "drag":
                    var hasMoved = false;
                    _this._selectedDots.each(function() {
                        if (_this._grapher.hasMoved(this)) {
                            hasMoved = true;
                            // break loop
                            return false;
                        }
                    });
                    if (hasMoved) {
                        _this._controller.doAction("saveSelectionPositions");
                    }
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

DotContext.prototype.loadSheet = function(sheet) {
    BaseContext.prototype.loadSheet.call(this, sheet);
    this.selectDots(this._selectedDots);
};

DotContext.prototype.unload = function() {
    this._removeEvents(document, ".workspace");
    this.deselectDots();

    $(".toolbar .edit-dots").removeClass("active");
    $(".toolbar .edit-dots-group").addClass("hide");
};

/**** ACTIONS ****/

/**
 * Deselects the given dots. If no dots are given, deselects all dots.
 *
 * @param {jQuery|undefined} dots -- dots to deselect (defaults to all dots)
 */
DotContext.prototype.deselectDots = function(dots) {
    if (dots === undefined) {
        dots = this._selectedDots;
    }

    dots.find(".dot-marker").attr("class", "dot-marker");
    this._selectedDots = this._selectedDots.not(dots);
};

/**
 * Move all selected dots the given amount
 *
 * @param {float} deltaX -- the amount to move in the x direction, in pixels
 * @param {float} deltaY -- the amount to move in the y direction, in pixels
 */
DotContext.prototype.moveSelection = function(deltaX, deltaY) {
    var _this = this;
    var options = {
        transition: true,
    };

    var prevScroll = {
        top: $(".workspace").scrollTop(),
        left: $(".workspace").scrollLeft(),
    };

    this._selectedDots
        .each(function() {
            var position = $(this).data("position");
            _this._grapher.moveDot(
                this,
                position.x + deltaX + scrollOffset.left,
                position.y + deltaY + scrollOffset.top,
                options
            );
        })
        .scrollToView(".workspace", {
            tolerance: 10,
        });

    scrollOffset.top += $(".workspace").scrollTop() - prevScroll.top;
    scrollOffset.left += $(".workspace").scrollLeft() - prevScroll.left;
};

/**
 * Nudge the selection of dots in the given direction.
 *
 * @param {int} deltaX -- the amount to move in the x direction, in steps
 * @param {int} deltaY -- the amount to move in the y direction, in steps
 */
DotContext.prototype.nudgeDots = function(deltaX, deltaY) {
    var scale = this._grapher.getScale();
    deltaX = scale.toDistance(deltaX);
    deltaY = scale.toDistance(deltaY);
    this.moveSelection(deltaX, deltaY);
    this._controller.doAction("saveSelectionPositions");
};

/**
 * Save the positions of all selected dots, both in the Grapher and in the
 * Sheet, and updates the movements for the dots in both this Sheet and
 * the previous Sheet.
 */
DotContext.prototype.saveSelectionPositions = function() {
    var _this = this;
    var scale = this._grapher.getScale();
    var dotsData = [];

    // save positions

    this._selectedDots.each(function() {
        // for undo/redo-ing
        var dotData = {
            selector: "#" + $(this).attr("id"),
            before: $(this).data("position"),
        };

        var position = _this._grapher.savePosition(this);
        var x = scale.toSteps(position.x - scale.minX);
        var y = scale.toSteps(position.y - scale.minY);
        _this._sheet.updatePosition(this, x, y);

        dotData.after = $(this).data("position");
        dotsData.push(dotData);
    });

    scrollOffset.top = 0;
    scrollOffset.left = 0;

    // update movements

    var dots = this._selectedDots.map(function() {
        return $(this).data("dot");
    }).toArray();
    this._sheet.updateMovements(dots);
    this._controller.checkContinuities({
        dots: dots,
        sheet: this._sheet,
        quiet: true,
    });

    var prevSheet = this._sheet.getPrevSheet();
    if (prevSheet) {
        prevSheet.updateMovements(dots);
        this._controller.checkContinuities({
            dots: dots,
            sheet: prevSheet,
            quiet: true,
        });
    }

    return {
        dots: dotsData,
        sheet: this._sheet,
    };
};
DotContext.prototype.saveSelectionPositions._name = "Move dots";
DotContext.prototype.saveSelectionPositions._undo = function(data) {
    this._revertMoveDots(data, true);
};
DotContext.prototype.saveSelectionPositions._redo = function(data) {
    this._revertMoveDots(data, false);
};

/**
 * Select all dots in the graph
 */
DotContext.prototype.selectAll = function() {
    this.selectDots(this._grapher.getDots());
};

/**
 * Add the given dots to the list of selected dots
 *
 * @param {jQuery} dots -- the dots to select
 * @param {object|undefined} options -- optional dictionary with the given options:
 *   - {boolean} append -- if false, deselect all dots before selecting (default true)
 */
DotContext.prototype.selectDots = function(dots, options) {
    options = options || {};

    if (options.append === false) {
        this.deselectDots();
    }

    this._selectedDots = this._selectedDots.add(dots);
    $(dots).find(".dot-marker").attr("class", "dot-marker selected");
};

/**
 * For each dot, if it's selected, deselect it; otherwise, select it.
 *
 * @param {jQuery} dots -- the dots to toggle selection
 */
DotContext.prototype.toggleDots = function(dots, options) {
    var select = dots.not(this._selectedDots);
    var deselect = dots.filter(this._selectedDots);

    this.selectDots(select);
    this.deselectDots(deselect);
};

/**** HELPERS ****/

/**
 * A helper function to revert saveSelectionPositions (both for undo or redo),
 * since undo-ing should actually also revert moving the dots (not just saving
 * the positions).
 *
 * @param {object} data -- the data returned from saveSelectionPositions
 * @param {boolean} isUndo -- true to undo the function, false to redo
 */
DotContext.prototype._revertMoveDots = function(data, isUndo) {
    var selectedDots = $();
    var scale = this._grapher.getScale();
    this._controller.loadSheet(data.sheet);

    data.dots.forEach(function(dot) {
        var elem = $(dot.selector);
        var position = isUndo ? dot.before : dot.after;

        this._grapher.moveDot(elem, position.x, position.y);

        var x = scale.toSteps(position.x - scale.minX);
        var y = scale.toSteps(position.y - scale.minY);
        data.sheet.updatePosition(elem, x, y);

        selectedDots = selectedDots.add(elem);
    }, this);

    var dots = this._selectedDots.map(function() {
        return $(this).data("dot");
    }).toArray();
    this._sheet.updateMovements(dots);
    var prevSheet = this._sheet.getPrevSheet();
    if (prevSheet) {
        prevSheet.updateMovements(dots);
    }
    
    this._selectedDots = selectedDots;
};

module.exports = DotContext;
