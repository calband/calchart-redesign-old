import * as _ from "lodash";

import BaseContext from "calchart/contexts/BaseContext";
import DotSelection from "calchart/DotSelection";
import DotType from "calchart/DotType";

import HTMLBuilder from "utils/HTMLBuilder";
import { round } from "utils/MathUtils";
import { setupPanel, showContextMenu } from "utils/UIUtils";

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

        // the panel to help select dots
        this._panel = $(".panel.select-dots");
        this._setupPanel();
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

        this._panel.show()
            .find(".dot-labels")
            .scrollTop(0);

        $(".toolbar .edit-dots").addClass("active");
        $(".toolbar .edit-dots-group").removeClass("hide");

        this.loadSelection("box");
    }

    unload() {
        super.unload();
        this.deselectDots();
        this._panel.hide();

        $(".toolbar .edit-dots").removeClass("active");
        $(".toolbar .edit-dots-group").addClass("hide");
    }

    /**
     * Deselect all dots.
     */
    deselectDots() {
        this._controller.deselectDots();
        this._panel.find(".dot-labels .active").removeClass("active");
    }

    /**
     * Get the Grapher
     */
    getGrapher() {
        return this._grapher;
    }

    /**
     * Load the given selection method.
     *
     * @param {string} name
     */
    loadSelection(name) {
        DotSelection.load(name);
        $(".toolbar .dot-selection li").removeClass("active");
        $(`.toolbar .${DotSelection.iconName}`).addClass("active");
    }

    /**
     * Select the given dots with the given options.
     *
     * @param {jQuery} dots
     * @param {Object} [options]
     */
    selectDots(dots, options) {
        this._controller.selectDots(dots, options);
        
        let dotLabels = this._panel.find(".dot-labels");
        options = _.defaultTo(options, {});
        if (!_.defaultTo(options.append, true)) {
            dotLabels.find(".active").removeClass("active");
        }
        dots.each(function() {
            let dot = $(this).data("dot");
            dotLabels.find(`.dot-${dot.label}`).addClass("active");
        });
    }

    /**
     * Toggle the given dots.
     *
     * @param {jQuery} dots
     */
    toggleDots(dots) {
        this._controller.toggleDots(dots);

        let dotLabels = this._panel.find(".dot-labels");
        dotLabels.find(".active").removeClass("active");
        this._controller.getSelectedDots().forEach(dot => {
            dotLabels.find(`.dot-${dot.label}`).addClass("active");
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
        let scale, dragStart, scrollOffset, moveOffset;

        let mousedown = e => {
            e.preventDefault();
            let target = $(e.target);

            // mass selection
            if (!target.is(".dot-marker")) {
                this.deselectDots();
                DotSelection.start(this, e);
                return;
            }

            let dot = target.parent();

            // toggle dot selection
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                this.toggleDots(dot);
                return;
            }

            if (!this._grapher.isSelected(dot)) {
                this.selectDots(dot, {
                    append: false,
                });
            }

            scale = this._grapher.getScale();
            dragStart = e;
            scrollOffset = {
                top: 0,
                left: 0,
            };
            moveOffset = {
                x: 0,
                y: 0,
            };

            $(document).on({
                "mousemove.dot-drag": mousemove,
                "mouseup.dot-drag": mouseup,
            });
        };

        let mousemove = e => {
            // change from beginning of move to now
            let deltaX = e.pageX - dragStart.pageX;
            let deltaY = e.pageY - dragStart.pageY;

            // snap deltaX and deltaY to grid; dots can themselves be off
            // the grid, but they move in a consistent interval
            let snap = scale.toDistance(this._grid);
            deltaX = round(scrollOffset.left + deltaX, snap);
            deltaY = round(scrollOffset.top + deltaY, snap);

            this._controller.getSelection()
                .each((i, dot) => {
                    let dotPosition = this._sheet.getPosition($(dot).data("dot"));
                    let position = scale.toDistanceCoordinates(dotPosition);
                    this._grapher.moveDotTo(dot, position.x + deltaX, position.y + deltaY);
                })
                .scrollIntoView({
                    parent: ".workspace",
                    tolerance: 10,
                    callback: (deltaX, deltaY) => {
                        scrollOffset.top += deltaY;
                        scrollOffset.left += deltaX;
                    },
                });

            moveOffset.x = deltaX;
            moveOffset.y = deltaY;
        };

        let mouseup = e => {
            let deltaX = scale.toSteps(moveOffset.x);
            let deltaY = scale.toSteps(moveOffset.y);

            if (deltaX !== 0 && deltaY !== 0) {
                this._controller.doAction("moveDots", [deltaX, deltaY]);
            }

            $(document).off(".dot-drag");
        };

        this._addEvents(".workspace", "mousedown", mousedown);
    }

    _setupPanel() {
        let _this = this;
        let controller = this._controller;
        let grapher = this._grapher;

        // add dot labels
        let dotLabels = this._panel.find(".dot-labels");
        this._controller.getShow().getDots().forEach(function(dot) {
            HTMLBuilder
                .li(dot.label)
                .addClass(`dot-${dot.label}`)
                .click(function() {
                    let $dot = grapher.getDot(dot);
                    controller.toggleDots($dot);
                    $(this).toggleClass("active");
                })
                .appendTo(dotLabels);
        });

        setupPanel(this._panel);

        // click on dot type
        this._panel.find(".dot-types li").click(function() {
            let dotType = $(this).data("type");
            let dots = _this._sheet.getDotsOfType(dotType);
            let $dots = grapher.getDots(dots);
            controller.selectDots($dots);
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
     * @param {DotType} dotType - The dot type to change to.
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
