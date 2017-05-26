import BaseContext from "calchart/contexts/BaseContext";
import Coordinate from "calchart/Coordinate";
import Dot from "calchart/Dot";
import Grapher from "calchart/Grapher";
import Sheet from "calchart/Sheet";

import { ActionError, AnimationStateError, ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import {
    attempt,
    empty,
    mapSome,
    parseArgs,
    parseNumber,
    underscoreKeys,
    update,
} from "utils/JSUtils";
import {
    isEqual,
    round,
} from "utils/MathUtils";
import {
    doAction,
    getData,
    hidePopup,
    promptFile,
    setupMenu,
    setupToolbar,
    showContextMenu,
    showError,
    showMessage,
    showPopup,
} from "utils/UIUtils";

let GraphState = {
    grapher: null,
    activeSheet: null,
    selectedDots: $(),
};

/**
 * A superclass for all contexts that edit Sheets, dots, and continuities.
 * Most contexts are GraphContexts, except MusicContext.
 */
export default class GraphContext extends BaseContext {
    static get shortcuts() {
        return GraphShortcuts;
    }

    static get actions() {
        return GraphActions;
    }

    static get refreshTargets() {
        return ["sidebar", "grapher"];
    }

    get grapher() {
        return GraphState.grapher;
    }

    get activeSheet() {
        return GraphState.activeSheet;
    }

    get sidebar() {
        return $(".graph-sidebar");
    }

    get workspace() {
        return $(".graph-workspace");
    }

    load(options) {
        super.load(options);

        // initialize grapher if not initialized
        if (_.isNull(this.grapher)) {
            GraphState.grapher = new Grapher(this.show, this.workspace, {
                boundDots: true,
                dotFormat: "dot-type",
                drawYardlineNumbers: true,
                draw4Step: true,
                expandField: true,
                showLabels: true,
                zoom: 1,
            });
            // initialize with field in view
            let scale = this.grapher.getScale();
            this.workspace.scrollLeft(scale.minX - 30);
            this.workspace.scrollTop(scale.minY - 30);
        }

        this._addEvents(this.sidebar, {
            contextmenu: e => {
                if ($(e.target).notIn(".stuntsheet")) {
                    showContextMenu(e, {
                        "Add Sheet...": "addStuntsheet",
                    });
                }
            },
        });

        this._addEvents(this.sidebar, ".stuntsheet", {
            contextmenu: e => {
                $(e.currentTarget).click();

                showContextMenu(e, {
                    "Properties...": "editSheetProperties",
                    "Duplicate Sheet": "duplicateSheet",
                    "Delete Sheet": "deleteSheet",
                });
            },
            click: e => {
                let sheet = $(e.currentTarget).data("sheet");
                if (sheet !== this.activeSheet) {
                    this.loadSheet(sheet);
                }
            },
        });

        let oldIndex;
        this.sidebar.sortable({
            containment: this.sidebar,
            activate: (e, ui) => {
                oldIndex = ui.item.index();
            },
            update: (e, ui) => {
                let index = ui.item.index();
                this.controller.doAction("moveSheet", [oldIndex, index]);
            },
        });

        this.workspace.pinch(e => {
            e.preventDefault();

            let delta = e.deltaY / 100;
            this.grapher.zoom(delta);
            this.refreshZoom(e.pageX, e.pageY);
        });

        $(".toolbar .graph-context-group").removeClass("hide");
    }

    unload() {
        super.unload();

        this.workspace.off(".pinch");
        $(".toolbar .graph-context-group").addClass("hide");
    }

    /**
     * Refresh the grapher
     */
    refreshGrapher() {
        if (this.activeSheet) {
            this.grapher.draw(this.activeSheet, this.getCurrentBeat());
            this.grapher.selectDots(GraphState.selectedDots);
        } else {
            this.grapher.drawField();
        }
    }

    /**
     * Refresh the sidebar
     */
    refreshSidebar() {
        this.sidebar.empty();
        
        this.show.getSheets().forEach(sheet => {
            let label = HTMLBuilder.span(sheet.getLabel(), "label");

            let preview = HTMLBuilder.div("preview");
            let $sheet = HTMLBuilder
                .div("stuntsheet", [label, preview], this.sidebar)
                .data("sheet", sheet);

            if (sheet === this.activeSheet) {
                $sheet.addClass("active");
            }
        });

        this.sidebar.find(".stuntsheet").each((i, $sheet) => {
            let sheet = $($sheet).data("sheet");
            let preview = $($sheet).find(".preview");

            // field preview
            let grapher = new Grapher(this.show, preview, {
                drawYardlines: false,
                fieldPadding: 5,
            });
            grapher.draw(sheet);
        });
    }

    /**
     * Refresh the toolbar
     */
    refreshToolbar() {
        // mark entire toolbar as inactive if there are no sheets
        if (this.show.getSheets().length === 0) {
            $(".toolbar li").addClass("inactive");
            // except new sheet
            $(".toolbar .add-stuntsheet").removeClass("inactive");
        } else {
            $(".toolbar li").removeClass("inactive");
        }
    }

    /**
     * Refresh the graph after zooming, keeping the given coordinate
     * in the same place afterwards.
     *
     * @param {number} [pageX] - The x-coordinate in the page to zoom
     *   into/out of. Defaults to the center of the graph.
     * @param {number} [pageY] - The y-coordinate in the page to zoom
     *   into/out of. Defaults to the center of the graph.
     */
    refreshZoom(pageX, pageY) {
        let offset = this.workspace.offset();

        // distance from top-left corner of workspace
        let left, top;
        if (_.isUndefined(pageX)) {
            left = this.workspace.outerWidth() / 2;
        } else {
            left = pageX - offset.left;
        }
        if (_.isUndefined(pageY)) {
            top = this.workspace.outerHeight() / 2;
        } else {
            top = pageY - offset.top;
        }

        // steps from top-left corner of field
        let start = this.grapher.getScale().toSteps({
            x: this.workspace.scrollLeft() + left,
            y: this.workspace.scrollTop() + top,
        });

        this.grapher.redrawZoom();
        this.refresh("grapher");

        // scroll workspace to keep same location under cursor
        let end = this.grapher.getScale().toDistance(start);
        this.workspace.scrollLeft(end.x - left);
        this.workspace.scrollTop(end.y - top);
    }

    /**** METHODS ****/

    /**
     * Show the popup that adds a stuntsheet to the Show
     */
    addStuntsheet() {
        showPopup("add-stuntsheet", {
            onSubmit: popup => {
                let data = getData(popup);

                data.numBeats = parseInt(data.numBeats);
                if (_.isNaN(data.numBeats)) {
                    throw new ValidationError("Please provide the number of beats in the stuntsheet.");
                } else if (data.numBeats <= 0) {
                    throw new ValidationError("Need to have a positive number of beats.");
                }

                this.controller.doAction("addSheet", [data.numBeats]);
            },
        });
    }

    /**
     * Check if any of the given dots have continuity errors in the currently
     * active sheet, showing a UI error if so. Can also pass arguments in as
     * an Object of keyword arguments.
     *
     * @param {Sheet} [sheet] - The Sheet to check continuities for. Skips check
     *   if the Sheet is the last Sheet in the show. (defaults to the currently
     *   active Sheet)
     * @param {(Dot[]|Dot|string)} [dots] - The dots to check continuities of,
     *   the dot type of the dots to check, or all the dots by default.
     * @param {boolean} [fullCheck=false] - if true, run a full check, which does the
     *   following actions:
     *     - check for collisions
     *     - show a success message if there are no errors
     * @return {boolean} true if no errors in checking continuities
     */
    checkContinuities() {
        let args = parseArgs(arguments, ["sheet", "dots", "fullCheck"]);
        let SUCCESS_MESSAGE = "Continuities valid!";

        let sheet = _.defaultTo(args.sheet, this.activeSheet);
        if (sheet.isLastSheet()) {
            if (args.fullCheck) {
                showMessage(SUCCESS_MESSAGE);
            }
            return true;
        }

        let duration = sheet.getDuration();
        let nextSheet = sheet.getNextSheet();

        let dots = args.dots;
        if (_.isUndefined(dots)) {
            dots = this.show.getDots();
        } else if (_.isString(dots)) {
            dots = sheet.getDotsOfType(dots);
        } else if (dots instanceof Dot) {
            dots = [dots];
        }

        let errors = {
            lackMoves: [],
            wrongPosition: [],
        };

        dots.forEach(dot => {
            let final = attempt(() => sheet.getAnimationState(dot, duration), {
                class: AnimationStateError,
                callback: ex => {
                    errors.lackMoves.push(dot.label);
                },
            });

            // ignore if no movements or if an AnimationStateError was caught
            if (_.isNull(final)) {
                return;
            }

            let position = nextSheet.getPosition(dot);
            if (!isEqual(final.x, position.x) || !isEqual(final.y, position.y)) {
                errors.wrongPosition.push(dot.label);
            }
        });

        let errorMessages = [];
        if (errors.lackMoves.length > 0) {
            errorMessages.push("Dots did not have enough to do: " + errors.lackMoves.join(", "));
        }
        if (errors.wrongPosition.length > 0) {
            errorMessages.push("Dots did not make it to their next spot: " + errors.wrongPosition.join(", "));
        }

        // check collisions
        if (args.fullCheck) {
            for (let beat = 0; beat < duration; beat++) {
                if (sheet.getCollisions(beat).length > 0) {
                    errorMessages.push("Collision detected");
                    break;
                }
            }
        }

        if (errorMessages.length > 0) {
            let label = sheet.getLabel();
            errorMessages.forEach(msg => {
                showError(`${msg} (SS ${label})`);
            });
            return false;
        } else {
            if (args.fullCheck) {
                showMessage(SUCCESS_MESSAGE);
            }
            return true;
        }
    }

    /**
     * Deselect the given dots.
     *
     * @param {jQuery} [dots] - Dots to deselect (defaults to all dots).
     */
    deselectDots(dots=GraphState.selectedDots) {
        GraphState.selectedDots = GraphState.selectedDots.not(dots);
        this.grapher.deselectDots(dots);
    }

    /**
     * Show the popup for editing the currently active sheet's properties.
     */
    editSheetProperties() {
        // update the background field in the popup
        let updateBackgroundInfo = popup => {
            let background = this.activeSheet.getBackground();
            let fileText;
            if (_.isUndefined(background)) {
                fileText = "none selected";
                popup.find(".hide-if-none").hide();
            } else {
                fileText = _.last(background.url.split("/"));
                popup.find(".hide-if-none").show();
            }
            popup.find(".background-image .background-url").text(fileText);
        };

        showPopup("edit-stuntsheet", {
            init: popup => {
                let label = _.defaultTo(this.activeSheet.label, "");
                popup.find(".label input").val(label);
                popup.find(".numBeats input").val(this.activeSheet.getDuration());
                popup.find(".fieldType select").choose(this.activeSheet.fieldType);
                popup.find(".stepType select").choose(this.activeSheet.stepType);
                popup.find(".orientation select").choose(this.activeSheet.orientation);

                popup.find(".beatsPerStep select")
                    .choose(this.activeSheet.beatsPerStep === "default" ? "default" : "custom")
                    .change(function() {
                        let disabled = $(this).val() !== "custom";
                        $(this).siblings("input").prop("disabled", disabled);
                    })
                    .change();
                popup.find(".beatsPerStep > input").val(this.activeSheet.getBeatsPerStep());

                updateBackgroundInfo(popup);

                // add/update/edit/remove image
                popup.off(".edit-background")
                    .on("click.edit-background", ".icons .edit-link", e => {
                        promptFile(file => {
                            let params = {
                                sheet: this.activeSheet.getIndex(),
                                image: file,
                            };

                            doAction("upload_sheet_image", params, {
                                dataType: "json",
                                success: data => {
                                    this.activeSheet.setBackground(data.url);
                                    updateBackgroundInfo(popup);
                                },
                            });
                        });
                    })
                    .on("click.edit-background", ".icons .move-link", e => {
                        this.controller.loadContext("background", {
                            previousContext: this.info.name,
                        });
                        hidePopup();
                    })
                    .on("click.edit-background", ".icons .clear-link", e => {
                        this.activeSheet.removeBackground();
                        updateBackgroundInfo(popup);
                    });
            },
            onSubmit: popup => {
                let data = getData(popup);

                // validate data
                if (data.label === "") {
                    data.label = null;
                }

                data.numBeats = parseInt(data.numBeats);
                if (_.isNaN(data.numBeats)) {
                    throw new ValidationError("Please provide the number of beats.");
                } else if (data.numBeats <= 0) {
                    throw new ValidationError("Need to have a positive number of beats.");
                }

                if (data.beatsPerStep === "custom") {
                    data.beatsPerStep = parseInt(data.customBeatsPerStep);
                    if (_.isNaN(data.beatsPerStep)) {
                        throw new ValidationError("Please provide the number of beats per step.");
                    } else if (data.beatsPerStep <= 0) {
                        throw new ValidationError("Beats per step needs to be a positive integer.");
                    }
                }

                this.controller.doAction("saveSheetProperties", [data]);
            },
        });
    }

    /**
     * @return {int} The beat in the current sheet to draw when refreshing the grapher.
     */
    getCurrentBeat() {
        // most contexts draw the first beat of a sheet
        return 0;
    }

    /**
     * @return {Dot[]}
     */
    getSelectedDots() {
        return _.map(
            GraphState.selectedDots,
            elem => $(elem).data("dot")
        );
    }

    /**
     * @return {jQuery}
     */
    getSelection() {
        return GraphState.selectedDots;
    }

    /**
     * Load the given Sheet.
     *
     * @param {Sheet} sheet
     */
    loadSheet(sheet) {
        GraphState.activeSheet = sheet;
        this.refresh();
    }

    /**
     * Select all dots in the graph.
     */
    selectAll() {
        this.selectDots(this.grapher.getDots());
    }

    /**
     * Add the given dots to the list of selected dots.
     *
     * @param {jQuery} dots - The dots to select.
     * @param {Object} [options] - Options to customize selection:
     *   - {boolean} [append=false] - If false, deselect all dots before selecting.
     */
    selectDots(dots, options={}) {
        if (!_.defaultTo(options.append, false)) {
            this.deselectDots();
        }

        GraphState.selectedDots = GraphState.selectedDots.add(dots);
        this.grapher.selectDots(GraphState.selectedDots);
    }

    /**
     * For each dot, if it's selected, deselect it; otherwise, select it.
     *
     * @param {jQuery} dots
     */
    toggleDots(dots) {
        let deselect = dots.filter(GraphState.selectedDots);

        this.selectDots(dots, {
            append: true,
        });
        this.deselectDots(deselect);
    }

    /**
     * Zoom by the given change in the field.
     *
     * @param {number} delta
     */
    zoom(delta) {
        this.grapher.zoom(delta);
        this.refreshZoom();
    }

    /**
     * Zoom to the given ratio.
     *
     * @param {number} ratio
     */
    zoomTo(ratio) {
        this.grapher.setOption("zoom", ratio);
        this.refreshZoom();
    }

    /**** HELPERS ****/

    /**
     * Convert a MouseEvent into a coordinate for the current mouse position,
     * rounded to the nearest step.
     *
     * @param {Event} e
     * @return {Coordinate}
     */
    _eventToSnapSteps(e) {
        let [x, y] = this.workspace.makeRelative(e.pageX, e.pageY);
        let steps = this.grapher.getScale().toSteps({x, y});
        return new Coordinate(round(steps.x, 1), round(steps.y, 1));
    }
}

let GraphShortcuts = {
    "alt+n": "addStuntsheet", // can't capture ctrl+n: http://stackoverflow.com/a/7296303/4966649
    "ctrl+backspace": "deleteSheet",
    "ctrl+d": "duplicateSheet",
};

class GraphActions {
    /**
     * Add a Sheet to the Show.
     *
     * @param {int} numBeats - The number of beats for the stuntsheet.
     */
    static addSheet(numBeats) {
        let sheet = this.show.addSheet(numBeats);
        this.loadSheet(sheet);
        this.refresh("sidebar", "toolbar");

        return {
            undo: function() {
                this.show.removeSheet(sheet);
                this.loadSheet(prevSheet);
                this.refresh("sidebar", "toolbar");
            },
        };
    }

    /**
     * Delete the currently active Sheet.
     *
     * @param {Sheet} [sheet=this.activeSheet]
     */
    static deleteSheet(sheet=this.activeSheet) {
        let prevSheet = sheet.getPrevSheet();
        let nextSheet = sheet.getNextSheet();

        this.show.removeSheet(sheet);
        this.loadSheet(_.defaultTo(prevSheet, nextSheet));

        return {
            data: [sheet],
            undo: function() {
                this.show.insertSheet(sheet, sheet.getIndex());
                this.loadSheet(sheet);
            },
        };
    }

    /**
     * Duplicate the currently active Sheet.
     *
     * @param {Sheet} [sheet=this.activeSheet]
     * @param {Sheet} [clone] - The cloned Sheet to readd, for redo.
     */
    static duplicateSheet(sheet=this.activeSheet, clone) {
        if (_.isUndefined(clone)) {
            clone = sheet.clone();
        }

        this.show.insertSheet(clone, sheet.getIndex() + 1);
        this.loadSheet(clone);

        return {
            data: [sheet, clone],
            undo: function() {
                this.show.removeSheet(clone);
                this.loadSheet(sheet);
            },
        };
    }

    /**
     * Move the corresponding Sheet from the given index to the
     * specified index.
     *
     * @param {int} from - The index the Sheet is currently at.
     * @param {int} to - The index to move to.
     */
    static moveSheet(from, to) {
        this.show.moveSheet(from, to);

        let sheets = this.show.getSheets();
        let toUpdate = mapSome([from - 1, to - 1, to], i => sheets[i]);

        toUpdate.forEach(sheet => {
            this.checkContinuities(sheet);
        });
        this.refresh("sidebar");

        return {
            undo: function() {
                this.show.moveSheet(to, from);
                toUpdate.forEach(sheet => {
                    this.checkContinuities(sheet);
                });
                this.refresh("sidebar");
            },
        };
    }

    /**
     * Save the given Sheet's properties.
     *
     * @param {Object} data - The data from the edit-stuntsheet popup.
     * @param {Sheet} [sheet=this.activeSheet]
     */
    static saveSheetProperties(data, sheet=this.activeSheet) {
        let changed = update(sheet, underscoreKeys(data));
        sheet.updateMovements();
        this.checkContinuities(sheet);
        this.refresh("grapher");

        return {
            data: [data, sheet],
            undo: function() {
                update(sheet, changed);
                sheet.updateMovements();
                this.refresh("grapher");
            },
        };
    }
}
