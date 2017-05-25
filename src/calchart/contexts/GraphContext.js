import BaseContext from "calchart/contexts/BaseContext";
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

let isGraphInitialized = false;
let GraphState = {
    grapher: null,
    sheet: null,
    currBeat: null, // TODO: move to ContinuityContext (#154)
    selectedDots: $(),
};

/**
 * A superclass for all contexts that edit Sheets, dots, and continuities.
 * Most contexts are GraphContexts, except MusicContext.
 */
export default class GraphContext extends BaseContext {
    constructor(controller) {
        super(controller);

        this._sidebar = $(".graph-sidebar");
        this._workspace = $(".graph-workspace");

        if (!isGraphInitialized) {
            this.init();
            isGraphInitialized = true;
        }

        // load state from GraphState
        this._grapher = GraphState.grapher;
        this._sheet = GraphState.sheet;
        this._currBeat = GraphState.currBeat;
        this._selectedDots = GraphState.selectedDots;
    }

    static get shortcuts() {
        return GraphShortcuts;
    }

    static get actions() {
        return GraphActions;
    }

    static get refreshTargets() {
        return ["sidebar", "grapher"];
    }

    /**
     * Actions to only run once, when the editor is initialized.
     */
    init() {
        // init sidebar

        let oldIndex;
        this._sidebar.sortable({
            containment: this._sidebar,
            activate: (e, ui) => {
                oldIndex = ui.item.index();
            },
            update: (e, ui) => {
                let index = ui.item.index();
                this.doAction("moveSheet", [oldIndex, index]);
            },
        });

        // init workspace

        GraphState.grapher = new Grapher(this._show, this._workspace, {
            boundDots: true,
            dotFormat: "dot-type",
            drawYardlineNumbers: true,
            draw4Step: true,
            expandField: true,
            showLabels: true,
            zoom: 1,
        });

        // initialize with field in view
        let scale = GraphState.grapher.getScale();
        this._workspace.scrollLeft(scale.minX - 30);
        this._workspace.scrollTop(scale.minY - 30);
    }

    load(options) {
        super.load(options);

        // load state from GraphContext
        this._grapher = GraphState.grapher;
        this._sheet = GraphState.sheet;
        this._currBeat = GraphState.currBeat;
        this._selectedDots = GraphState.selectedDots;

        this._addEvents(this._sidebar, {
            contextmenu: e => {
                if ($(e.target).notIn(".stuntsheet")) {
                    showContextMenu(e, {
                        "Add Sheet...": "addStuntsheet",
                    });
                }
            },
        });

        this._addEvents(this._sidebar, ".stuntsheet", {
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
                if (sheet !== this._sheet) {
                    this.loadSheet(sheet);
                }
            },
        });

        this._workspace.pinch(e => {
            e.preventDefault();

            let delta = e.deltaY / 100;
            this._grapher.zoom(delta);
            this.refreshZoom(e.pageX, e.pageY);
        });

        $(".toolbar .graph-context-group").removeClass("hide");
    }

    unload() {
        super.unload();

        // save state in GraphContext
        GraphState.grapher = this._grapher;
        GraphState.sheet = this._sheet;
        GraphState.currBeat = this._currBeat;
        GraphState.selectedDots = this._selectedDots;

        this._workspace.off(".pinch");
        $(".toolbar .graph-context-group").addClass("hide");
    }

    /**
     * Refresh the grapher
     */
    refreshGrapher() {
        if (this._sheet) {
            this._grapher.draw(this._sheet, this._currBeat);
            this._grapher.selectDots(this._selectedDots);
        } else {
            this._grapher.drawField();
        }
    }

    /**
     * Refresh the sidebar
     */
    refreshSidebar() {
        this._sidebar.empty();
        
        this._show.getSheets().forEach(sheet => {
            let label = HTMLBuilder.span(sheet.getLabel(), "label");

            let preview = HTMLBuilder.div("preview");
            let $sheet = HTMLBuilder
                .div("stuntsheet", [label, preview], this._sidebar)
                .data("sheet", sheet);

            if (sheet === this._sheet) {
                $sheet.addClass("active");
            }
        });

        this._sidebar.find(".stuntsheet").each((i, $sheet) => {
            let sheet = $($sheet).data("sheet");
            let preview = $($sheet).find(".preview");

            // field preview
            let grapher = new Grapher(this._show, preview, {
                drawOrientation: false,
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
        if (this._show.getSheets().length === 0) {
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
        let offset = this._workspace.offset();

        // distance from top-left corner of workspace
        let left, top;
        if (_.isUndefined(pageX)) {
            left = this._workspace.outerWidth() / 2;
        } else {
            left = pageX - offset.left;
        }
        if (_.isUndefined(pageY)) {
            top = this._workspace.outerHeight() / 2;
        } else {
            top = pageY - offset.top;
        }

        // steps from top-left corner of field
        let start = this._grapher.getScale().toSteps({
            x: this._workspace.scrollLeft() + left,
            y: this._workspace.scrollTop() + top,
        });

        this._grapher.redrawZoom();
        this.refresh("grapher");

        // scroll workspace to keep same location under cursor
        let end = this._grapher.getScale().toDistance(start);
        this._workspace.scrollLeft(end.x - left);
        this._workspace.scrollTop(end.y - top);
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

                this._controller.doAction("addSheet", [data.numBeats]);
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

        let sheet = _.defaultTo(args.sheet, this._sheet);
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
            dots = this._show.getDots();
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
    deselectDots(dots=this._selectedDots) {
        this._selectedDots = this._selectedDots.not(dots);
        this._grapher.deselectDots(dots);
    }

    /**
     * Show the popup for editing the currently active sheet's properties.
     */
    editSheetProperties() {
        // update the background field in the popup
        let updateBackgroundInfo = popup => {
            let background = this._sheet.getBackground();
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
                let label = _.defaultTo(this._sheet.label, "");
                popup.find(".label input").val(label);
                popup.find(".numBeats input").val(this._sheet.getDuration());
                popup.find(".fieldType select").choose(this._sheet.fieldType);
                popup.find(".stepType select").choose(this._sheet.stepType);
                popup.find(".orientation select").choose(this._sheet.orientation);

                popup.find(".beatsPerStep select")
                    .choose(this._sheet.beatsPerStep === "default" ? "default" : "custom")
                    .change(function() {
                        let disabled = $(this).val() !== "custom";
                        $(this).siblings("input").prop("disabled", disabled);
                    })
                    .change();
                popup.find(".beatsPerStep > input").val(this._sheet.getBeatsPerStep());

                updateBackgroundInfo(popup);

                // add/update/edit/remove image
                popup.off(".edit-background")
                    .on("click.edit-background", ".icons .edit-link", e => {
                        promptFile(file => {
                            let params = {
                                sheet: this._sheet.getIndex(),
                                image: file,
                            };

                            doAction("upload_sheet_image", params, {
                                dataType: "json",
                                success: data => {
                                    this._sheet.setBackground(data.url);
                                    updateBackgroundInfo(popup);
                                },
                            });
                        });
                    })
                    .on("click.edit-background", ".icons .move-link", e => {
                        this._controller.loadContext("background", {
                            previousContext: this.info.name,
                        });
                        hidePopup();
                    })
                    .on("click.edit-background", ".icons .clear-link", e => {
                        this._sheet.removeBackground();
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

                this._controller.doAction("saveSheetProperties", [data]);
            },
            onHide: popup => {
                // refresh to show background
                this.refresh("grapher");
            },
        });
    }

    /**
     * Go to the zero-th beat of the sheet.
     */
    firstBeat() {
        this._currBeat = 0;
        this.refresh("grapher");
    }

    /**
     * @return {Sheet}
     */
    getActiveSheet() {
        return this._sheet;
    }

    /**
     * @return {Grapher}
     */
    getGrapher() {
        return this._grapher;
    }

    /**
     * @return {Dot[]}
     */
    getSelectedDots() {
        return _.map(
            this._selectedDots,
            elem => $(elem).data("dot")
        );
    }

    /**
     * @return {jQuery}
     */
    getSelection() {
        return this._selectedDots;
    }

    /**
     * Go to the last beat of the sheet.
     */
    lastBeat() {
        this._currBeat = this._sheet.getDuration();
        this.refresh("grapher");
    }

    /**
     * Load the given Sheet.
     *
     * @param {Sheet} sheet
     */
    loadSheet(sheet) {
        this._sheet = sheet;
        this._currBeat = 0;

        this.refresh();
    }

    /**
     * Increment the current beat.
     */
    nextBeat() {
        this._currBeat++;
        let duration = this._sheet.getDuration();

        if (this._currBeat > duration) {
            this._currBeat = duration;
        } else {
            this.refresh("grapher");
        }
    }

    /**
     * Decrement the current beat.
     */
    prevBeat() {
        this._currBeat--;

        if (this._currBeat < 0) {
            this._currBeat = 0;
        } else {
            this.refresh("grapher");
        }
    }

    /**
     * Select all dots in the graph.
     */
    selectAll() {
        this.selectDots(this._grapher.getDots());
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

        this._selectedDots = this._selectedDots.add(dots);
        this._grapher.selectDots(this._selectedDots);
    }

    /**
     * For each dot, if it's selected, deselect it; otherwise, select it.
     *
     * @param {jQuery} dots
     */
    toggleDots(dots) {
        let deselect = dots.filter(this._selectedDots);

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
        this._grapher.zoom(delta);
        this.refreshZoom();
    }

    /**
     * Zoom to the given ratio.
     *
     * @param {number} ratio
     */
    zoomTo(ratio) {
        this._grapher.setOption("zoom", ratio);
        this.refreshZoom();
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
        let sheet = this._show.addSheet(numBeats);
        this.loadSheet(sheet);
        this.refresh("toolbar");

        return {
            undo: function() {
                this._show.removeSheet(sheet);
                this.loadSheet(prevSheet);
                this.refresh("toolbar");
            },
        };
    }

    /**
     * Delete the currently active Sheet.
     *
     * @param {Sheet} [sheet=this._sheet]
     */
    static deleteSheet(sheet=this._sheet) {
        let prevSheet = sheet.getPrevSheet();
        let nextSheet = sheet.getNextSheet();

        this._show.removeSheet(sheet);
        this.loadSheet(_.defaultTo(prevSheet, nextSheet));

        return {
            data: [sheet],
            undo: function() {
                this._show.insertSheet(sheet, sheet.getIndex());
                this.loadSheet(sheet);
            },
        };
    }

    /**
     * Duplicate the currently active Sheet.
     *
     * @param {Sheet} [sheet=this._sheet]
     * @param {Sheet} [clone] - The cloned Sheet to readd, for redo.
     */
    static duplicateSheet(sheet=this._sheet, clone) {
        if (_.isUndefined(clone)) {
            clone = sheet.clone();
        }

        this._show.insertSheet(clone, sheet.getIndex() + 1);
        this.loadSheet(clone);

        return {
            data: [sheet, clone],
            undo: function() {
                this._show.removeSheet(clone);
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
        this._show.moveSheet(from, to);

        let sheets = this._show.getSheets();
        let toUpdate = mapSome([from - 1, to - 1, to], i => sheets[i]);

        toUpdate.forEach(sheet => {
            this.checkContinuities(sheet);
        });
        this.refresh();

        return {
            undo: function() {
                this._show.moveSheet(to, from);
                toUpdate.forEach(sheet => {
                    this.checkContinuities(sheet);
                });
                this.refresh();
            },
        };
    }

    /**
     * Save the given Sheet's properties.
     *
     * @param {Object} data - The data from the edit-stuntsheet popup.
     * @param {Sheet} [sheet=this._sheet]
     */
    static saveSheetProperties(data, sheet=this._sheet) {
        let changed = update(sheet, underscoreKeys(data));
        sheet.updateMovements();
        this.checkContinuities(sheet);
        this.refresh();

        return {
            data: [data, sheet],
            undo: function() {
                update(sheet, changed);
                sheet.updateMovements();
                this.refresh();
            },
        };
    }
}
