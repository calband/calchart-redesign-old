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
            .scrollIntoView({
                parent: ".workspace",
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

                showContextMenu(e, {
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
        let controller = this._controller;
        let workspace = $(".workspace").offset();
        let graph = this._grapher.getGraph();
        let scale;

        // variables to track state when dragging dots
        let dragState = "none"; // none, drag, select
        let dragStart = null;
        let scrollStart = {};

        this._addEvents(".workspace", {
            mousedown: e => {
                let target = $(e.target);

                if (target.is(".dot-marker")) {
                    let dot = target.parent();

                    if (e.shiftKey || e.ctrlKey || e.metaKey) {
                        controller.toggleDots(dot);
                        dragState = "none";
                        return;
                    }

                    if (!this._grapher.isSelected(dot)) {
                        controller.selectDots(dot, {
                            append: false,
                        });
                    }

                    dragState = "drag";
                    this._scrollOffset.top = 0;
                    this._scrollOffset.left = 0;
                    this._moveOffset.x = 0;
                    this._moveOffset.y = 0;
                } else {
                    controller.deselectDots();
                    HTMLBuilder.div("selection-box", null, $(".workspace"));
                    dragState = "select";
                }

                dragStart = e;
                scrollStart = {
                    top: $(".workspace").scrollTop(),
                    left: $(".workspace").scrollLeft(),
                };
                scale = this._grapher.getScale();
            },
        });

        this._addEvents(document, {
            mousemove: e => {
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
                        let snap = scale.toDistance(this._grid);
                        deltaX = round(this._scrollOffset.left + deltaX, snap);
                        deltaY = round(this._scrollOffset.top + deltaY, snap);
                        this.moveSelection(deltaX, deltaY);
                        this._moveOffset.x = deltaX;
                        this._moveOffset.y = deltaY;
                        break;
                    case "select":
                        // relative to workspace
                        let width = Math.abs(deltaX);
                        let height = Math.abs(deltaY);

                        let minX = Math.min(e.pageX, dragStart.pageX) - workspace.left + scrollStart.left;
                        let minY = Math.min(e.pageY, dragStart.pageY) - workspace.top + scrollStart.top;

                        // contain in graph
                        let maxX = Math.min(minX + width, graph.outerWidth());
                        let maxY = Math.min(minY + height, graph.outerHeight());
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
                            .scrollIntoView({
                                parent: ".workspace",
                                callback: function(deltaX, deltaY) {
                                    scrollStart.top += deltaY;
                                    scrollStart.left += deltaX;
                                },
                            });

                        // select dots within the selection box
                        controller.deselectDots();
                        this._grapher.getDots().each(function() {
                            let dot = $(this);
                            let position = dot.data("position");
                            if (
                                position.x >= minX &&
                                position.x <= maxX &&
                                position.y >= minY &&
                                position.y <= maxY
                            ) {
                                controller.selectDots(dot);
                            }
                        });
                }
            },
            mouseup: () => {
                switch (dragState) {
                    case "drag":
                        if (this._moveOffset.x === 0 && this._moveOffset.y === 0) {
                            break;
                        }
                        let deltaX = scale.toSteps(this._moveOffset.x);
                        let deltaY = scale.toSteps(this._moveOffset.y);
                        controller.doAction("moveDots", [deltaX, deltaY]);
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
    "ctrl+1": "changeDotType(plain)",
    "ctrl+2": "changeDotType(solid)",
    "ctrl+3": "changeDotType(plain-forwardslash)",
    "ctrl+4": "changeDotType(solid-forwardslash)",
    "ctrl+5": "changeDotType(plain-backslash)",
    "ctrl+6": "changeDotType(solid-backslash)",
    "ctrl+7": "changeDotType(plain-x)",
    "ctrl+8": "changeDotType(solid-x)",
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
     * @param {Dot[]} [dots] - The dots to change dot types for. Defaults to
     *   the currently selected dots.
     * @param {Sheet} [sheet] - The sheet to change dot types for. Defaults
     *   to the current sheet.
     */
    static changeDotType(dotType, dots, sheet=this._sheet) {
        if (_.isUndefined(dots)) {
            dots = this._controller.getSelectedDots();
        }

        let oldTypes = {};

        dots.forEach(function(dot) {
            let dotType = sheet.getDotType(dot);
            if (_.isUndefined(oldTypes[dotType])) {
                oldTypes[dotType] = [];
            }
            oldTypes[dotType].push(dot);
        });

        sheet.changeDotTypes(dots, dotType);
        this._controller.loadSheet(sheet);

        return {
            data: [dotType, dots, sheet],
            undo: function() {
                _.each(oldTypes, function(dots, dotType) {
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
        if (_.isUndefined(dots)) {
            dots = this._controller.getSelectedDots();
        }

        let prevPositions = {};

        let scale = this._grapher.getScale();
        let _deltaX = scale.toDistance(deltaX);
        let _deltaY = scale.toDistance(deltaY);
        let boundPosition = position => {
            position = scale.toDistanceCoordinates(position);

            let x = _.clamp(position.x + _deltaX, 0, this._grapher.svgWidth);
            let y = _.clamp(position.y + _deltaY, 0, this._grapher.svgHeight);

            return scale.toStepCoordinates({ x, y });
        };

        // update positions
        dots.forEach(dot => {
            // copy position
            let prevPosition = sheet.getPosition(dot);
            prevPositions[dot.label] = _.clone(prevPosition);

            // bound dots within graph
            let position = boundPosition(prevPosition);
            sheet.updatePosition(dot, position.x, position.y);
        });

        // update movements

        let controller = this._controller;
        let _updateMovements = function() {
            sheet.updateMovements(dots);
            controller.checkContinuities(sheet, dots);

            let prevSheet = sheet.getPrevSheet();
            if (prevSheet) {
                prevSheet.updateMovements(dots);
                controller.checkContinuities(prevSheet, dots);
            }
        };
        _updateMovements();

        // refresh
        controller.loadSheet(sheet);

        return {
            data: [deltaX, deltaY, sheet, dots],
            undo: function() {
                dots.forEach(function(dot) {
                    let position = prevPositions[dot.label];
                    sheet.updatePosition(dot, position.x, position.y);
                });
                _updateMovements();
                controller.loadSheet(sheet);
            },
        };
    }
}
