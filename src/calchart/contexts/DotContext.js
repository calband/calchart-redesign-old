import * as _ from "lodash";

import BaseContext from "calchart/contexts/BaseContext";
import DotType from "calchart/DotType";
import EditTools from "calchart/EditTools";

import HTMLBuilder from "utils/HTMLBuilder";
import { parseNumber } from "utils/JSUtils";
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

        // the tool that's currently handling any mouse event in the workspace
        this._activeTool = null;

        // number of steps to snap dots to when dragging: 0, 1, 2, 4
        this._grid = 2;
        this._setupSnap();

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
        this._setupContextMenus();

        this._panel.show()
            .find(".dot-labels")
            .scrollTop(0);

        this.loadTool("selection");
        this._addEvents(".workspace", "mousedown", e => {
            this._activeTool.handle(this, e);
        });

        $(".toolbar .edit-dots").addClass("active");
        $(".toolbar .edit-dots-group").removeClass("hide");
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
     * @return {Grapher}
     */
    getGrapher() {
        return this._grapher;
    }

    /**
     * @return {int}
     */
    getGrid() {
        return this._grid;
    }

    /**
     * Load the given editing tool.
     *
     * @param {string} name
     */
    loadTool(name) {
        this._activeTool = EditTools.load(name);
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

    _setupSnap() {        
        let _this = this;

        $(".toolbar .snap-to select")
            .change(function() {
                _this._grid = parseNumber($(this).val());
            })
            .choose(2);

        $(".toolbar .resnap button").click(() => {
            this._controller.getShow().getDots().forEach(dot => {
                let position = this._sheet.getPosition(dot);
                position.x = round(position.x, this._grid);
                position.y = round(position.y, this._grid);
            });
            this._controller.refresh();
        });
    }

    /**
     * Update movements after editing dot positions.
     *
     * @param {Dot[]} dots - The dots to update movements for.
     * @param {Sheet} sheet - The sheet to update movements in
     */
    _updateMovements(dots, sheet) {
        sheet.updateMovements(dots);
        this._controller.checkContinuities(sheet, dots);

        let prevSheet = sheet.getPrevSheet();
        if (prevSheet) {
            prevSheet.updateMovements(dots);
            this._controller.checkContinuities(prevSheet, dots);
        }
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
    "s": "loadTool(selection)",
    "a": "loadTool(lasso)",
    "l": "loadTool(line)",
    "r": "loadTool(rectangle)",
    "c": "loadTool(circle)",
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

        this._updateMovements(dots, sheet);

        // refresh
        this._controller.loadSheet(sheet);

        return {
            data: [deltaX, deltaY, sheet, dots],
            undo: function() {
                dots.forEach(function(dot) {
                    let position = prevPositions[dot.label];
                    sheet.updatePosition(dot, position.x, position.y);
                });
                this._updateMovements(dots, sheet);
                this._controller.loadSheet(sheet);
            },
        };
    }

    /**
     * Move the given dots to the given positions.
     *
     * @param {Object[]} data - The dots to move and their positions
     *   (in steps), as an array of objects in the format
     *   {
     *        dot: Dot,
     *        x: number,
     *        y: number,
     *   }
     * @param {Sheet} [sheet] - The sheet to move dots for. Defaults
     *   to the currently loaded stunt sheet.
     */
    static moveDotsTo(data, sheet=this._sheet) {
        let dots = [];
        let oldData = data.map(info => {
            let oldPosition = _.clone(sheet.getPosition(info.dot));
            sheet.updatePosition(info.dot, info.x, info.y);
            dots.push(info.dot);
            return {
                dot: info.dot,
                x: oldPosition.x,
                y: oldPosition.y,
            };
        });

        this._updateMovements(dots, sheet);
        this._controller.loadSheet(sheet);

        return {
            data: [data, sheet],
            undo: function() {
                oldData.forEach(info => {
                    sheet.updatePosition(info.dot, info.x, info.y);
                });
                this._updateMovements(dots, sheet);
                this._controller.loadSheet(sheet);
            },
        };
    }
}
