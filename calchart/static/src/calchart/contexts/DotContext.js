import * as _ from "lodash";

import BaseContext from "calchart/contexts/BaseContext";

import HTMLBuilder from "utils/HTMLBuilder";
import { round } from "utils/MathUtils";
import { showContextMenu } from "utils/UIUtils";

/**
 * The Context that allows a user to select and edit dots with a drag
 * and drop interface.
 */
export default class DotContext extends BaseContext {
    constructor(controller) {
        super(controller);

        this._grapher = controller.getGrapher();

        // number of steps to snap dots to when dragging: null, 1, 2, 4
        this._grid = 2;

        // tracks how much the workspace has scrolled while dragging dots
        this._scrollOffset = {};
        // tracks how far the selection has been moved from their initial positions
        this._moveOffset = {};
    }

    static get shortcuts() {
        return ContextShortcuts;
    }

    static get actions() {
        return ContextActions;
    }

    load(options) {
        this._setupDrag();
        this._setupContextMenus();

        $(".toolbar .edit-dots").addClass("active");
        $(".toolbar .edit-dots-group").removeClass("hide");

        this.loadSelection("box");
    }

    unload() {
        super.unload();
        this._controller.deselectDots();

        $(".toolbar .edit-dots").removeClass("active");
        $(".toolbar .edit-dots-group").addClass("hide");
    }

    /**
     * Load the given selection method.
     *
     * @param {string} name
     */
    loadSelection(name) {
        let toolbarClass;

        // TODO: make it actually change selection method
        switch (name) {
            case "box":
                toolbarClass = "selection";
                break;
            case "lasso":
                toolbarClass = "lasso";
                break;
            default:
                throw new Error(`No selection named: ${name}`);
        }

        $(".toolbar .dot-selection li").removeClass("active");
        $(`.toolbar .${toolbarClass}`).addClass("active");
    }

    /**
     * Move all selected dots the given amount, from the dot's initial
     * position (i.e. from the position as stored in the Sheet).
     *
     * @param {float} deltaX - The amount to move in the x direction, in pixels.
     * @param {float} deltaY - The amount to move in the y direction, in pixels.
     */
    moveSelection(deltaX, deltaY) {
        let _this = this;
        let scale = this._grapher.getScale();

        this._controller.getSelection()
            .each(function() {
                let dotPosition = _this._sheet.getPosition($(this).data("dot"));
                let position = scale.toDistanceCoordinates(dotPosition);
                _this._grapher.moveDotTo(this, position.x + deltaX, position.y + deltaY);
            })
            .scrollIntoView(".workspace", {
                tolerance: 10,
                callback: function(deltaX, deltaY) {
                    _this._scrollOffset.top += deltaY;
                    _this._scrollOffset.left += deltaX;
                },
            });
    }

    /**
     * Set up the events for showing context menus.
     */
    _setupContextMenus() {
        let _this = this;

        this._addEvents(".workspace", {
            contextmenu: function(e) {
                showContextMenu(e, {
                    "Edit continuity...": "loadContext(continuity)",
                });
            },
        });

        this._addEvents(".dot-marker", {
            contextmenu: function(e) {
                let dot = $(this).parent().data("dot");
                let dotType = _this._sheet.getDotType(dot);

                UIUtils.showContextMenu(e, {
                    "Edit continuity...": `loadContext(continuity, dotType=${dotType})`,
                    "Change dot type": {
                        "Plain": "changeDotType(plain)",
                        "Solid": "changeDotType(solid)",
                        "Plain Forwardslash": "changeDotType(plain-forwardslash)",
                        "Solid Forwardslash": "changeDotType(solid-forwardslash)",
                        "Plain Backslash": "changeDotType(plain-backslash)",
                        "Solid Backslash": "changeDotType(solid-backslash)",
                        "Plain Cross": "changeDotType(plain-x)",
                        "Solid Cross": "changeDotType(solid-x)",
                    },
                });
                return false;
            },
        });
    }

    /**
     * Set up the events for selecting/dragging dots.
     */
    _setupDrag() {
        let _this = this;
        let scale = this._grapher.getScale();

        let workspace = $(".workspace").offset();
        let graph = this._grapher.getGraph();
        let svg = {
            width: graph.outerWidth(),
            height: graph.outerHeight(),
        };

        // variables to track state when dragging dots
        let dragState = "none"; // none, drag, select
        let dragStart = null;
        let scrollStart = {};

        this._addEvents(".workspace", {
            mousedown: function(e) {
                let target = $(e.target);

                if (target.is(".dot-marker")) {
                    let dot = target.parent();

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
                    HTMLBuilder.div("selection-box", null, $(".workspace"));
                    dragState = "select";
                }

                dragStart = e;
                scrollStart = {
                    top: $(".workspace").scrollTop(),
                    left: $(".workspace").scrollLeft(),
                };
            },
        });

        this._addEvents(document, {
            mousemove: function(e) {
                if (dragState === "none") {
                    return;
                }

                e.preventDefault();

                // change from beginning of move to now
                let deltaX = e.pageX - dragStart.pageX;
                let deltaY = e.pageY - dragStart.pageY;

                switch (dragState) {
                    case "drag":
                        // snap deltaX and deltaY to grid; dots can themselves be off
                        // the grid, but they move in a consistent interval
                        let snap = scale.toDistance(_this._grid);
                        deltaX = round(_this._scrollOffset.left + deltaX, snap);
                        deltaY = round(_this._scrollOffset.top + deltaY, snap);
                        _this.moveSelection(deltaX, deltaY);
                        _this._moveOffset.x = deltaX;
                        _this._moveOffset.y = deltaY;
                        break;
                    case "select":
                        // relative to workspace
                        let width = Math.abs(deltaX);
                        let height = Math.abs(deltaY);

                        let minX = Math.min(e.pageX, dragStart.pageX) - workspace.left + scrollStart.left;
                        let minY = Math.min(e.pageY, dragStart.pageY) - workspace.top + scrollStart.top;

                        // contain in graph
                        let maxX = Math.min(minX + width, svg.width);
                        let maxY = Math.min(minY + height, svg.height);
                        width = maxX - minX;
                        height = maxY - minY;

                        // update dimensions of the selection box
                        $(".selection-box")
                            .css({
                                top: minY,
                                left: minX,
                                width: width,
                                height: height,
                            })
                            .scrollIntoView(".workspace", {
                                callback: function(deltaX, deltaY) {
                                    scrollStart.top += deltaY;
                                    scrollStart.left += deltaX;
                                },
                            });

                        // select dots within the selection box
                        _this._controller.deselectDots();
                        _this._grapher.getDots().each(function() {
                            let dot = $(this);
                            let position = dot.data("position");
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
                        let deltaX = scale.toSteps(_this._moveOffset.x);
                        let deltaY = scale.toSteps(_this._moveOffset.y);
                        _this._controller.doAction("moveDots", [deltaX, deltaY]);
                        break;
                    case "select":
                        $(".selection-box").remove();
                        break;
                }

                dragState = "none";
            },
        });
    }
}

let ContextShortcuts = {
    "s": "loadSelection(box)",
    "l": "loadSelection(lasso)",
    "left": "moveDots(-1, 0)",
    "up": "moveDots(0, -1)",
    "right": "moveDots(1, 0)",
    "down": "moveDots(0, 1)",
    "shift+left": "moveDots(-4, 0)",
    "shift+up": "moveDots(0, -4)",
    "shift+right": "moveDots(4, 0)",
    "shift+down": "moveDots(0, 4)",
    "ctrl+a": "selectAll",
};

class ContextActions {
    /**
     * Change the currently selected dots' dot type to the given dot type.
     *
     * @param {string} dotType - The dot type to change to.
     * @param {Sheet} [sheet] -- The sheet to change dot types for. Defaults
     *   to the current sheet.
     */
    static changeDotType(dotType, sheet=this._sheet) {
        let selected = this._controller.getSelectedDots();
        let oldTypes = {};

        selected.forEach(function(dot) {
            let dotType = sheet.getDotType(dot);
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
    }

    /**
     * Move the given dots by the given distance.
     *
     * @param {float} deltaX - The distance to move the dots in the
     *   x-direction, in steps.
     * @param {float} deltaY - The distance to move the dots in the
     *   y-direction, in steps.
     * @param {Sheet} [sheet] - The sheet to move dots for. Defaults
     *   to the currently loaded stunt sheet.
     * @param {Dot[]} [dots] - The dots to move. Defaults to the
     *   currently selected dots.
     */
    static moveDots(deltaX, deltaY, sheet=this._sheet, dots) {
        if (dots === undefined) {
            dots = this._controller.getSelectedDots();
        }

        let prevPositions = {};

        // update positions

        dots.forEach(function(dot) {
            let position = sheet.getPosition(dot);
            // copy position
            prevPositions[dot.getLabel()] = _.clone(position);
            sheet.updatePosition(dot, position.x + deltaX, position.y + deltaY);
        });

        // update movements

        let controller = this._controller;
        let _updateMovements = function() {
            sheet.updateMovements(dots);
            controller.checkContinuities({
                dots: dots,
                sheet: sheet,
                quiet: true,
            });

            let prevSheet = sheet.getPrevSheet();
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
                    let position = prevPositions[dot.getLabel()];
                    sheet.updatePosition(dot, position.x, position.y);
                });
                _updateMovements();
                controller.loadSheet(sheet);
            },
        };
    }
}
