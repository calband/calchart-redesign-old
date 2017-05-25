import GraphContext from "calchart/contexts/GraphContext";
import DotType from "calchart/DotType";
import EditTools from "calchart/EditTools";

import HTMLBuilder from "utils/HTMLBuilder";
import { mapSome, parseNumber } from "utils/JSUtils";
import { round } from "utils/MathUtils";
import { setupPanel, showContextMenu } from "utils/UIUtils";

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

        // the panel to help select dots
        this._panel = $(".panel.select-dots");
        this._setupPanel();

        // whether to show the Sheet's background image
        this._backgroundVisible = false;
    }

    static get shortcuts() {
        return ContextShortcuts;
    }

    static get actions() {
        return ContextActions;
    }

    static get info() {
        return {
            name: "dot",
            toolbar: "edit-dots",
        };
    }

    static get refreshTargets() {
        return super.refreshTargets.concat(["panel"]);
    }

    load(options) {
        super.load(options);

        this._addEvents(".workspace", {
            contextmenu: e => {
                showContextMenu(e, {
                    "Edit continuity...": "loadContext(continuity)",
                });
            },
        });

        this._addEvents(".dot-marker", {
            contextmenu: e => {
                let dot = $(e.currentTarget).parent().data("dot");
                let dotType = this._sheet.getDotType(dot);

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

        this._panel.show()
            .find(".dot-labels")
            .scrollTop(0);

        this.loadTool("selection");
        this._addEvents(".workspace", {
            mousedown: e => {
                e.preventDefault();
                this._activeTool.mousedown(e);

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

        $(".menu-item.toggle-background").removeClass("disabled");
    }

    unload() {
        super.unload();
        this.deselectDots();
        this._panel.hide();
        this._grapher.showBackground(false);

        $(".menu-item.toggle-background").addClass("disabled");
    }

    refreshGrapher() {
        super.refreshGrapher();
        this._grapher.showBackground(this._backgroundVisible);
    }

    refreshPanel() {
        // highlight dots in panel
        let dotLabels = this._panel.find(".dot-labels");
        dotLabels.find(".active").removeClass("active");
        this.getSelectedDots().forEach(dot => {
            dotLabels.find(`.dot-${dot.id}`).addClass("active");
        });
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
     *     refresh the context (optimization).
     */
    deselectDots(dots, options={}) {
        options = _.defaults({}, options, {
            refresh: true,
        });

        super.deselectDots(dots);
        if (options.refresh) {
            this.refresh("grapher", "panel");
        }
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
     *   - {boolean} [append=true] - Set to false to deselect
     *     dots before selecting
     *   - {boolean} [refresh=true] - Set to false to manually
     *     refresh the context (optimization).
     */
    selectDots(dots, options={}) {
        options = _.defaults({}, options, {
            append: true,
            refresh: true,
        });

        super.selectDots(dots, options);
        if (options.refresh) {
            this.refresh("grapher", "panel");
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
     *     refresh the context (optimization).
     */
    toggleDots(dots, options={}) {
        options = _.defaults({}, options, {
            refresh: true,
        });

        super.toggleDots(dots);
        if (options.refresh) {
            this.refresh("grapher", "panel");
        }
    }

    _setupPanel() {
        // track last dot selected
        let lastSelected = undefined;

        // add dot labels
        let dotLabels = this._panel.find(".dot-labels");
        this._show.getDots().forEach(dot => {
            HTMLBuilder.li(dot.label)
                .addClass(`dot-${dot.id}`)
                .click(e => {
                    let $dot = this._grapher.getDot(dot);
                    if (e.ctrlKey || e.metaKey) {
                        this.toggleDots($dot);

                        if ($(e.currentTarget).hasClass("active")) {
                            lastSelected = dot;
                        } else {
                            lastSelected = undefined;
                        }
                    } else if (e.shiftKey && lastSelected) {
                        let range = $();
                        let delta = Math.sign(dot.id - lastSelected.id);
                        let curr = lastSelected.id;
                        while (curr !== dot.id) {
                            curr += delta;
                            range = range.add(this._grapher.getDot(curr));
                        }
                        this.selectDots(range);
                        lastSelected = dot;
                    } else {
                        this.selectDots($dot, {
                            append: false,
                        });
                        lastSelected = dot;
                    }
                })
                .appendTo(dotLabels);
        });

        setupPanel(this._panel);

        // click on dot type
        this._panel.find(".dot-types li").click(e => {
            let dotType = $(e.currentTarget).data("type");
            let dots = this._sheet.getDotsOfType(dotType);
            let $dots = this._grapher.getDots(dots);
            this.selectDots($dots, {
                append: e.shiftKey || e.ctrlKey || e.metaKey,
            });
        });
    }

    _setupSnap() {
        $(".toolbar .snap-to select")
            .change(e => {
                this._grid = parseNumber($(e.currentTarget).val());
            })
            .choose(2);

        $(".toolbar .resnap button").click(e => {
            if (this._grid !== 0) {
                this._controller.doAction("resnapDots");
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
     * @param {Sheet} [sheet=this._sheet]
     */
    static changeDotType(dotType, dots, sheet=this._sheet) {
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
     * @param {Sheet} [sheet=this._sheet]
     */
    static moveDots(deltaX, deltaY, dots, sheet=this._sheet) {
        if (_.isUndefined(dots)) {
            dots = this._controller.getSelectedDots();
        }

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
     * @param {Sheet} [sheet=this._sheet]
     */
    static moveDotsTo(data, sheet=this._sheet) {
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
     * @param {Sheet} [sheet=this._sheet]
     */
    static resnapDots(data, sheet=this._sheet) {
        if (_.isUndefined(data)) {
            data = mapSome(this._show.getDots(), dot => {
                let position = this._sheet.getPosition(dot);
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
     * @param {Sheet} [sheet=this._sheet]
     */
    static swapDots(dot1, dot2, sheet=this._sheet) {
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
