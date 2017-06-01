import DotType from "calchart/DotType";
import GraphContext from "editor/contexts/GraphContext";
import EditTools from "editor/EditTools";
import { DotContextMenus as menus } from "editor/EditorContextMenus";
import DotPanel from "panels/DotPanel";

import { mapSome, parseNumber } from "utils/JSUtils";
import { round } from "utils/MathUtils";

/**
 * The Context that allows a user to select and edit dots with a drag
 * and drop interface.
 */
export default class DotContext extends GraphContext {
    constructor(controller) {
        super(controller);

        // the tool that's currently handling any mouse event in the workspace
        this._activeTool = null;

        // number of steps to snap dots to when dragging: 0, 1, 2, 4
        this._grid = 2;
        this._setupSnap();

        // whether to show the Sheet's background image
        this._backgroundVisible = false;
    }

    static get shortcuts() {
        return _.extend({}, super.shortcuts, ContextShortcuts);
    }

    static get actions() {
        return ContextActions;
    }

    static get name() {
        return "dot";
    }

    get panel() {
        return DotPanel;
    }

    load(options) {
        super.load(options);

        this._addEvents(this.workspace, {
            contextmenu: e => {
                new menus.WorkspaceMenu(this, e).show();
            },
        });

        this._addEvents(this.workspace, ".dot-marker", {
            contextmenu: e => {
                let dot = $(e.currentTarget).parent().data("dot");
                let dotType = this.activeSheet.getDotType(dot);
                new menus.DotMenu(this, e, dotType).show();

                // don't activate edit tool
                return false;
            },
        });

        this.loadTool("selection");
        this._addEvents(this.workspace, {
            mousedown: e => {
                e.preventDefault();
                this._activeTool.handle(e);

                $(document).on({
                    "mousemove.edit-tool": e => {
                        this._activeTool.mousemove(e);
                    },
                    "mouseup.edit-tool": e => {
                        this._activeTool.mouseup(e);
                        if (this._activeTool.isDone()) {
                            $(document).off(".edit-tool");
                        }
                    },
                });
            },
        });
    }

    unload() {
        super.unload();

        this.deselectDots({
            refresh: false,
        });
        this.grapher.showBackground(false);
    }

    refreshGrapher() {
        super.refreshGrapher();
        this.grapher.showBackground(this._backgroundVisible);
    }

    refreshZoom(pageX, pageY) {
        super.refreshZoom(pageX, pageY);
        this._activeTool.refreshZoom();
    }

    /**** METHODS ****/

    /**
     * Deselect the given dots.
     *
     * @param {jQuery} [dots] - Dots to deselect (defaults to all dots).
     * @param {Object} [options]
     *   - {boolean} [refresh=true] - Set to false to manually
     *     refresh the panel (optimization).
     */
    deselectDots(dots, options={}) {
        if (_.isPlainObject(arguments[0])) {
            dots = undefined;
            options = arguments[0];
        }

        options = _.defaults({}, options, {
            refresh: true,
        });

        super.deselectDots(dots);
        if (options.refresh) {
            this.refresh("panel");
        }
    }

    /**
     * @return {?int} The snap grid as steps, or null if no snap.
     */
    getGrid() {
        if (this._grid === 0) {
            return null;
        } else {
            return this._grid;
        }
    }

    /**
     * Load the given editing tool.
     *
     * @param {string} name
     */
    loadTool(name) {
        if (this._activeTool) {
            this._activeTool.unload();
        }
        this._activeTool = EditTools.load(this, name);
    }

    /**
     * Select the given dots with the given options. Defaults
     * to appending the dots to the selection.
     *
     * @param {jQuery} dots
     * @param {Object} [options]
     *   - {boolean} [append=false] - If false, deselect all dots
     *     before selecting.
     *   - {boolean} [refresh=true] - Set to false to manually
     *     refresh the panel (optimization).
     */
    selectDots(dots, options={}) {
        options = _.defaults({}, options, {
            refresh: true,
        });

        super.selectDots(dots, options);
        if (options.refresh) {
            this.refresh("panel");
        }
    }

    /**
     * Toggle the background image for the Sheet.
     */
    toggleBackground() {
        this._backgroundVisible = !this._backgroundVisible;
        this.refresh("grapher");
    }

    /**
     * Toggle the given dots.
     *
     * @param {jQuery} dots
     * @param {Object} [options]
     *   - {boolean} [refresh=true] - Set to false to manually
     *     refresh the panel (optimization).
     */
    toggleDots(dots, options={}) {
        options = _.defaults({}, options, {
            refresh: true,
        });

        super.toggleDots(dots);
        if (options.refresh) {
            this.refresh("panel");
        }
    }

    _setupSnap() {
        $(".toolbar .snap-to select")
            .change(e => {
                this._grid = parseNumber($(e.currentTarget).val());
            })
            .choose(2);

        $(".toolbar .resnap button").click(e => {
            if (this._grid !== 0) {
                this.controller.doAction("resnapDots");
            }
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
        this.checkContinuities(sheet, dots);

        let prevSheet = sheet.getPrevSheet();
        if (prevSheet) {
            prevSheet.updateMovements(dots);
            this.checkContinuities(prevSheet, dots);
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
    "shift+s": "loadTool(lasso)",
    "w": "loadTool(swap)",
    "l": "loadTool(line)",
    "a": "loadTool(arc)",
    "b": "loadTool(block)",
    "r": "loadTool(circle)",
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

class ContextActions extends GraphContext.actions {
    /**
     * Change the currently selected dots' dot type to the given dot type.
     *
     * @param {DotType} dotType - The dot type to change to.
     * @param {Dot[]} [dots] - The dots to change dot types for. Defaults to
     *   the currently selected dots.
     * @param {Sheet} [sheet=this.activeSheet]
     */
    static changeDotType(dotType, dots, sheet=this.activeSheet) {
        if (_.isUndefined(dots)) {
            dots = this.getSelectedDots();
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
        this.loadSheet(sheet);

        return {
            data: [dotType, dots, sheet],
            undo: function() {
                _.each(oldTypes, (dots, dotType) => {
                    sheet.changeDotTypes(dots, dotType);
                });
                this.loadSheet(sheet);
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
     * @param {Dot[]} [dots] - The dots to move. Defaults to the
     *   currently selected dots.
     * @param {Sheet} [sheet=this.activeSheet]
     */
    static moveDots(deltaX, deltaY, dots, sheet=this.activeSheet) {
        if (_.isUndefined(dots)) {
            dots = this.getSelectedDots();
        }

        let scale = this.grapher.getScale();
        let _deltaX = scale.toDistance(deltaX);
        let _deltaY = scale.toDistance(deltaY);
        let boundPosition = position => {
            position = scale.toDistance(position);

            let x = _.clamp(position.x + _deltaX, 0, this.grapher.svgWidth);
            let y = _.clamp(position.y + _deltaY, 0, this.grapher.svgHeight);

            return scale.toSteps({ x, y });
        };

        // update positions
        let prevPositions = {};
        dots.forEach(dot => {
            // copy position
            let prevPosition = sheet.getPosition(dot);
            prevPositions[dot.label] = prevPosition;

            // bound dots within graph
            let position = boundPosition(prevPosition);
            sheet.setPosition(dot, position.x, position.y);
        });

        this._updateMovements(dots, sheet);

        this.loadSheet(sheet);

        return {
            data: [deltaX, deltaY, dots, sheet],
            undo: function() {
                dots.forEach(dot => {
                    let position = prevPositions[dot.label];
                    sheet.setPosition(dot, position.x, position.y);
                });
                this._updateMovements(dots, sheet);
                this.loadSheet(sheet);
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
     * @param {Sheet} [sheet=this.activeSheet]
     */
    static moveDotsTo(data, sheet=this.activeSheet) {
        let dots = [];
        let oldData = data.map(info => {
            let oldPosition = sheet.getPosition(info.dot);
            sheet.setPosition(info.dot, info.x, info.y);
            dots.push(info.dot);
            return {
                dot: info.dot,
                x: oldPosition.x,
                y: oldPosition.y,
            };
        });

        this._updateMovements(dots, sheet);
        this.loadSheet(sheet);

        return {
            label: "move dots",
            data: [data, sheet],
            undo: function() {
                oldData.forEach(info => {
                    sheet.setPosition(info.dot, info.x, info.y);
                });
                this._updateMovements(dots, sheet);
                this.loadSheet(sheet);
            },
        };
    }

    /**
     * Resnap dots to the grid.
     *
     * @param {Object[]} [data] - Data to pass to moveDotsTo. Used when
     *   redo-ing to optimize performance.
     * @param {Sheet} [sheet=this.activeSheet]
     */
    static resnapDots(data, sheet=this.activeSheet) {
        if (_.isUndefined(data)) {
            data = mapSome(this.show.getDots(), dot => {
                let position = this.activeSheet.getPosition(dot);
                let rounded = {
                    dot: dot,
                    x: round(position.x, this._grid),
                    y: round(position.y, this._grid),
                };
                if (rounded.x !== position.x || rounded.y !== position.y) {
                    return rounded;
                }
            });
        }

        let result = ContextActions.moveDotsTo.call(this, data, sheet);
        return {
            data: [data, sheet],
            undo: result.undo,
        };
    }

    /**
     * Swap the given dots in the given sheet.
     *
     * @param {Dot} dot1
     * @param {Dot} dot2
     * @param {Sheet} [sheet=this.activeSheet]
     */
    static swapDots(dot1, dot2, sheet=this.activeSheet) {
        let swap = () => {
            sheet.swapDots(dot1, dot2);
            this._updateMovements([dot1, dot2], sheet);
            this.loadSheet(sheet);
        };
        swap();

        return {
            data: [dot1, dot2, sheet],
            undo: swap,
        };
    }
}
