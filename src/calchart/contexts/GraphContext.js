import BaseContext from "calchart/contexts/BaseContext";
import Dot from "calchart/Dot";
import Grapher from "calchart/Grapher";
import Sheet from "calchart/Sheet";

import { ActionError, AnimationStateError, ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import {
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

/**
 * A superclass for all contexts that edit Sheets, dots, and continuities.
 * Most contexts are GraphContexts, except MusicContext.
 */
export default class GraphContext extends BaseContext {
    /**
     * Initialize the editor when first loading the page.
     *
     * @param {EditorController} controller
     */
    static init(controller) {
        this.grapher = null;
        this.activeSheet = null;
        this.currBeat = null;
        this.selectedDots = $();

        let show = controller.getShow();

        // init sidebar

        let oldIndex;
        $(".graph-sidebar").sortable({
            containment: ".graph-sidebar",
            activate: (e, ui) => {
                oldIndex = ui.item.index();
            },
            update: (e, ui) => {
                let index = ui.item.index();
                _this.doAction("moveSheet", [oldIndex, index]);
            },
        });

        // init workspace

        let workspace = $(".graph-workspace");
        this.grapher = new Grapher(show, workspace, {
            boundDots: true,
            drawYardlineNumbers: true,
            draw4Step: true,
            drawDotType: true,
            expandField: true,
            showLabels: true,
            zoom: 1,
        });

        // initialize with field in view
        let scale = this.grapher.getScale();
        workspace.scrollLeft(scale.minX - 30);
        workspace.scrollTop(scale.minY - 30);
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

    load(options) {
        super.load(options);

        // load state from GraphContext
        this._grapher = this.constructor.grapher;
        this._activeSheet = this.constructor.activeSheet;
        this._currBeat = this.constructor.currBeat;
        this._selectedDots = this.constructor.selectedDots;

        this._addEvents(".graph-sidebar", {
            contextmenu: e => {
                if ($(e.target).notIn(".stuntsheet")) {
                    showContextMenu(e, {
                        "Add Sheet...": "addStuntsheet",
                    });
                }
            },
        });

        this._addEvents(".graph-sidebar", ".stuntsheet", {
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
                if (sheet !== this._activeSheet) {
                    this.loadSheet(sheet);
                }
            },
        });

        $(".graph-workspace").pinch(e => {
            e.preventDefault();

            let delta = e.deltaY / 100;
            this._grapher.zoom(delta);
            this.refreshZoom(e.pageX, e.pageY);
        });
    }

    unload() {
        super.unload();

        // save state in GraphContext
        this.constructor.grapher = this._grapher;
        this.constructor.activeSheet = this._activeSheet;
        this.constructor.currBeat = this._currBeat;
        this.constructor.selectedDots = this._selectedDots;

        $(".graph-workspace").off(".pinch");
    }

    /**
     * Refresh the grapher
     */
    refreshGrapher() {
        if (this._activeSheet) {
            this._grapher.draw(this._activeSheet, this._currBeat);
        } else {
            this._grapher.drawField();
        }
    }

    /**
     * Refresh the sidebar
     */
    refreshSidebar() {
        let sidebar = $(".graph-sidebar").empty();
        
        this._controller.getShow().getSheets().forEach(sheet => {
            let label = HTMLBuilder.span(sheet.getLabel(), "label");

            let preview = HTMLBuilder.div("preview");
            let $sheet = HTMLBuilder
                .div("stuntsheet", [label, preview], sidebar)
                .data("sheet", sheet);

            if (sheet === this._activeSheet) {
                $sheet.addClass("active");
            }
        });

        sidebar.find(".stuntsheet").each((i, elem) => {
            let sheet = $(elem).data("sheet");
            let preview = $(elem).find(".preview");

            // field preview
            let grapher = new Grapher(this._controller.getShow(), preview, {
                drawOrientation: false,
                drawYardlines: false,
                fieldPadding: 5,
            });
            grapher.draw(sheet);
        });
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
        let workspace = $(".graph-workspace");
        let offset = workspace.offset();

        // distance from top-left corner of workspace
        let left, top;
        if (_.isUndefined(pageX)) {
            left = workspace.outerWidth() / 2;
        } else {
            left = pageX - offset.left;
        }
        if (_.isUndefined(pageY)) {
            top = workspace.outerHeight() / 2;
        } else {
            top = pageY - offset.top;
        }

        // steps from top-left corner of field
        let start = this._grapher.getScale().toStepCoordinates({
            x: workspace.scrollLeft() + left,
            y: workspace.scrollTop() + top,
        });

        this._grapher.clearField();
        this.refresh("grapher");

        // scroll workspace to keep same location under cursor
        let end = this._grapher.getScale().toDistanceCoordinates(start);
        workspace.scrollLeft(end.x - left);
        workspace.scrollTop(end.y - top);
    }

    /**** METHODS ****/

    /**
     * Show the popup that adds a stuntsheet to the Show
     */
    addStuntsheet() {
        let controller = this;
        let firstSheet = this._show.getSheets().length === 0;

        showPopup("add-stuntsheet", {
            onSubmit: function(popup) {
                let data = getData(popup);

                data.numBeats = parseInt(data.numBeats);
                if (_.isNaN(data.numBeats)) {
                    throw new ValidationError("Please provide the number of beats in the stuntsheet.");
                } else if (data.numBeats <= 0) {
                    throw new ValidationError("Need to have a positive number of beats.");
                }

                controller.doAction("addSheet", [data.numBeats]);
                if (firstSheet) {
                    $(".toolbar li").removeClass("inactive");
                }
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
        let successMessage = "Continuities valid!";

        let sheet = _.defaultTo(args.sheet, this._activeSheet);
        if (sheet.isLastSheet()) {
            if (args.fullCheck) {
                showMessage(successMessage);
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
            let final;
            try {
                final = sheet.getAnimationState(dot, duration);
            } catch (e) {
                if (e instanceof AnimationStateError) {
                    errors.lackMoves.push(dot.label);
                    return;
                } else {
                    throw e;
                }
            }

            // ignore if no movements
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
        }

        if (args.fullCheck) {
            showMessage(successMessage);
        }
        return true;
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
        let sheet = this._activeSheet;

        function updateBackgroundInfo(popup) {
            let background = sheet.getBackground();
            let fileText;
            if (_.isUndefined(background)) {
                fileText = "none selected";
                popup.find(".hide-if-none").hide();
            } else {
                fileText = _.last(background.url.split("/"));
                popup.find(".hide-if-none").show();
            }
            popup.find(".background-image .background-url").text(fileText);
        }

        showPopup("edit-stuntsheet", {
            init: popup => {
                let label = _.defaultTo(sheet.label, "");
                popup.find(".label input").val(label);
                popup.find(".numBeats input").val(sheet.getDuration());
                popup.find(".fieldType select").choose(sheet.fieldType);
                popup.find(".stepType select").choose(sheet.stepType);
                popup.find(".orientation select").choose(sheet.orientation);

                popup.find(".beatsPerStep select")
                    .choose(sheet.beatsPerStep === "default" ? "default" : "custom")
                    .change(function() {
                        let disabled = $(this).val() !== "custom";
                        $(this).siblings("input").prop("disabled", disabled);
                    })
                    .change();
                popup.find(".beatsPerStep > input").val(sheet.getBeatsPerStep());

                updateBackgroundInfo(popup);

                // add/update image
                popup.find(".icons .edit-link")
                    .off("click")
                    .click(function() {
                        promptFile(function(file) {
                            let params = {
                                sheet: sheet.getIndex(),
                                image: file,
                            };

                            doAction("upload_sheet_image", params, {
                                dataType: "json",
                                success: function(data) {
                                    sheet.setBackground(data.url);
                                    updateBackgroundInfo(popup);
                                },
                            });
                        });
                    });

                // edit image (move and resize)
                popup.find(".icons .move-link")
                    .off("click")
                    .click(e => {
                        let options = {
                            previousContext: this._context.info.name,
                        };
                        this.loadContext("background", options);
                        hidePopup();
                    });

                // remove image
                popup.find(".icons .clear-link")
                    .off("click")
                    .click(function() {
                        sheet.removeBackground();
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

                this.doAction("saveSheetProperties", [data]);
            },
            onHide: popup => {
                // refresh to show background
                this.refresh();
            },
        });
    }

    /**
     * Go to the zero-th beat of the sheet.
     */
    firstBeat() {
        this._currBeat = 0;
        this.refresh("grapher", "context");
    }

    /**
     * @return {Dot[]} The selected dots, as Dot objects.
     */
    getSelectedDots() {
        return this._selectedDots.map(function() {
            return $(this).data("dot");
        }).toArray();
    }

    /**
     * Go to the last beat of the sheet.
     */
    lastBeat() {
        this._currBeat = this._activeSheet.getDuration();
        this.refresh("grapher", "context");
    }

    /**
     * Load the given Sheet.
     *
     * @param {Sheet} sheet
     */
    loadSheet(sheet) {
        this._activeSheet = sheet;
        this._currBeat = 0;

        this.refresh();
    }

    /**
     * Increment the current beat.
     */
    nextBeat() {
        this._currBeat++;
        let duration = this._activeSheet.getDuration();

        if (this._currBeat > duration) {
            this._currBeat = duration;
        } else {
            this.refresh("grapher", "context");
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
            this.refresh("grapher", "context");
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
     * Set the current beat to the given beat.
     *
     * @param {int} beat
     */
    setBeat(beat) {
        this._currBeat = beat;
    }

    /**
     * For each dot, if it's selected, deselect it; otherwise, select it.
     *
     * @param {jQuery} dots
     */
    toggleDots(dots) {
        let select = dots.not(this._selectedDots);
        let deselect = dots.filter(this._selectedDots);

        this.selectDots(select, {
            append: true,
        });
        this.deselectDots(deselect);
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

    /**
     * Zoom in to the field.
     */
    zoomIn() {
        this._grapher.zoom(+0.1);
        this.refreshZoom();
    }

    /**
     * Zoom out of the field.
     */
    zoomOut() {
        this._grapher.zoom(-0.1);
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

        return {
            undo: function() {
                this._show.removeSheet(sheet);
                this.loadSheet(prevSheet);
            },
        };
    }

    /**
     * Delete the currently active Sheet.
     *
     * @param {Sheet} [sheet] - The deleted Sheet to redelete, for redo.
     */
    static deleteSheet(sheet=this._activeSheet) {
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
     * @param {Sheet} [clone] - The cloned Sheet to readd, for redo.
     */
    static duplicateSheet(clone) {
        let sheet = this._activeSheet;

        if (_.isUndefined(clone)) {
            clone = sheet.clone();
            clone.setIndex(sheet.getIndex() + 1);
        }

        this._show.insertSheet(clone, clone.getIndex());
        this.loadSheet(clone);

        return {
            data: [clone],
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
     * @param {Sheet} [sheet=this._activeSheet]
     */
    static saveSheetProperties(data, sheet=this._activeSheet) {
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
