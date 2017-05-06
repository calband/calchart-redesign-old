import ApplicationController from "calchart/ApplicationController";
import Context from "calchart/Context";
import Dot from "calchart/Dot";
import Grapher from "calchart/Grapher";
import Sheet from "calchart/Sheet";

import { ActionError, AnimationStateError, ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { empty, mapSome, parseArgs, parseNumber, underscoreKeys, update } from "utils/JSUtils";
import { round } from "utils/MathUtils";
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
 * The controller that stores the state of the editor application and contains
 * all of the actions that can be run in the editor page.
 */
export default class EditorController extends ApplicationController {
    /**
     * @param {Show} show - The show being edited in the application.
     */
    constructor(show) {
        super(show);

        this._grapher = null;
        this._context = null;
        this._activeSheet = null;
        this._currBeat = null;
        this._selectedDots = $(); // dots selected to edit, used with DotContext

        this._undoHistory = [];
        this._redoHistory = [];

        // track last saved state of show
        this._savedShow = JSON.stringify(this._show.serialize());
    }

    static get actions() {
        return EditorActions;
    }

    get actions() { return this.constructor.actions; }

    static get shortcuts() {
        return EditorShortcuts;
    }

    static getAllShortcutCommands() {
        return _.extend(super.getAllShortcutCommands(), Context.getAllShortcutCommands());
    }

    init() {
        super.init();

        let controller = this;
        setupMenu(".menu");
        setupToolbar(".toolbar");
        this._setupSidebar();

        let workspace = $(".workspace");
        this._grapher = new Grapher(this._show, workspace, {
            boundDots: true,
            drawYardlineNumbers: true,
            draw4Step: true,
            drawDotType: true,
            expandField: true,
            showLabels: true,
            zoom: 1,
        });
        this._grapher.drawField();
        // initialize with field in view
        let scale = this._grapher.getScale();
        workspace.scrollLeft(scale.minX - 30);
        workspace.scrollTop(scale.minY - 30);

        // set up pinch zoom
        let graph = this._grapher.getGraph();
        workspace.pinch(e => {
            e.preventDefault();

            let delta = e.deltaY / 100;
            this._grapher.zoom(delta);
            this.refreshZoom(e.pageX, e.pageY);
        });

        // set up zoom item in toolbar
        let toolbarZoom = $(".toolbar .zoom-to select");
        HTMLBuilder.make("option.custom").appendTo(toolbarZoom);
        toolbarZoom
            .change(function() {
                let zoom = parseNumber($(this).val());
                controller.zoomTo(zoom);
            })
            .choose(1);

        let sheet = _.first(this._show.getSheets());
        if (sheet) {
            this.loadSheet(sheet);
        }

        this.loadContext("dot");

        // mark entire toolbar as inactive if there are no sheets
        if (this._show.getSheets().length === 0) {
            $(".toolbar li").addClass("inactive");
            // except new sheet
            $(".toolbar .add-stuntsheet").removeClass("inactive");
        }

        // prompt user if leaving while unsaved, unless in development
        if (!window.isLocal) {
            $(window).on("beforeunload", () => {
                let data = JSON.stringify(this._show.serialize());
                if (data !== this._savedShow) {
                    return true;
                }
            });
        }
    }

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
            if (final.x !== position.x || final.y !== position.y) {
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
     * Run the method with the given name.
     *
     * The method can either be an instance method or an action. An action is
     * anything that modifies the Show. All actions can be undone and redone.
     * All other methods (things that update the controller, context, etc.) are
     * instance methods.
     *
     * @param {string} name - The function to call (@see EditorController#_parseAction).
     * @param {Array} [args] - Arguments to pass to the action. Can also be passed in name
     *   (see _parseAction), which will override any arguments passed in as a parameter
     */
    doAction(name, args=[]) {
        let action = this._getAction(name);
        action.args = _.defaultTo(action.args, args);

        let data = action.function.apply(action.context, action.args);

        if (action.canUndo && data !== false) {
            let actionData = _.extend({}, data, action);
            // if data was returned from the action, use it for redos instead
            // of the initial args
            actionData.args = _.defaultTo(data.data, action.args);
            this._undoHistory.push(actionData);

            // after doing an action, can't redo previous actions
            empty(this._redoHistory);

            this._updateHistory();
        }
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
                            previousContext: Context.name(this._context),
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
     * Show the popup for editing the show properties.
     */
    editShowProperties() {
        let controller = this;
        let show = this._show;

        showPopup("edit-show", {
            init: function(popup) {
                popup.find(".fieldType select").choose(show.getFieldType());
                popup.find(".beatsPerStep input").val(show.getBeatsPerStep());
                popup.find(".stepType select").choose(show.getStepType());
                popup.find(".orientation select").choose(show.getOrientation());
            },
            onSubmit: function(popup) {
                let data = getData(popup);

                // validate data
                data.beatsPerStep = parseInt(data.beatsPerStep);
                if (_.isNaN(data.beatsPerStep)) {
                    throw new ValidationError("Please provide the number of beats per step.");
                } else if (data.beatsPerStep <= 0) {
                    throw new ValidationError("Beats per step needs to be a positive integer.");
                }

                controller.doAction("saveShowProperties", [data]);
            },
        });
    }

    /**
     * Automatically download the JSON file for the show.
     */
    export() {
        let slug = this._show.getSlug();
        window.open(`/download/${slug}.json`);
    }

    /**
     * Go to the zero-th beat of the sheet.
     */
    firstBeat() {
        this._currBeat = 0;
        this.refresh("grapher", "context");
    }

    /**
     * @param {?Sheet} The currently active sheet, or null if there is no active Sheet (i.e.
     *   there are no Sheets in the Show).
     */
    getActiveSheet() {
        return this._activeSheet;
    }

    /**
     * @param {int}
     */
    getCurrentBeat() {
        return this._currBeat;
    }

    /**
     * @return {Grapher}
     */
    getGrapher() {
        return this._grapher;
    }

    /**
     * @return {jQuery} The selected dots.
     */
    getSelection() {
        return this._selectedDots;
    }

    /**
     * @return {Dot[]} The selected dots, as Dot objects.
     */
    getSelectedDots() {
        return this._selectedDots.map(function() {
            return $(this).data("dot");
        }).toArray();
    }

    getShortcut(shortcut) {
        let action = super.getShortcut(shortcut);
        return _.defaultTo(action, this._context.shortcuts[shortcut]);
    }

    /**
     * Go to the last beat of the sheet.
     */
    lastBeat() {
        this._currBeat = this._activeSheet.getDuration();
        this.refresh("grapher", "context");
    }

    /**
     * Loads a Context for the application.
     *
     * @param {string} name - The name of the Context to load.
     * @param {Object} [options] - Any options to customize loading the context.
     *   Will also be passed to Context.load.
     *   - {boolean} [unload=true] - Whether to unload the current context
     *     before loading the next one.
     */
    loadContext(name, options={}) {
        // don't load same context
        if (name === Context.name(this._context)) {
            return;
        }

        if (_.defaultTo(options.unload, true) && this._context) {
            this._context.unload();
        }

        $("body").attr("class", `context-${name}`);
        this._context = Context.load(name, this, options);
        this.refresh();
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
     * Open the help pages.
     */
    openHelp() {
        window.open("/help", "_blank");
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
     * Redo the last undone action.
     */
    redo() {
        if (this._redoHistory.length === 0) {
            return;
        }

        let actionData = this._redoHistory.pop();
        let newData = actionData.function.apply(actionData.context, actionData.args);
        // update undo function
        actionData.undo = newData.undo;

        this._undoHistory.push(actionData);
        this._updateHistory();
    }

    /**
     * Refresh the UI according to the current state of the editor
     * and Show.
     *
     * @param {...String} [targets=all] - The elements to refresh.
     *   Elements that can be refreshed:
     *     - all
     *     - sidebar (default all)
     *     - sidebarPreviews (default sidebar)
     *     - grapherClear: empties grapher before refreshing
     *     - grapher (default all || grapherClear)
     *     - context (default all)
     */
    refresh(...targets) {
        // targets to refresh
        let refresh = {};
        refresh.all = targets.includes("all") || targets.length === 0;
        refresh.sidebar = refresh.all || targets.includes("sidebar");
        refresh.sidebarPreviews = refresh.sidebar || targets.includes("sidebarPreviews");
        refresh.grapherClear = targets.includes("grapherClear");
        refresh.grapher = refresh.all || refresh.grapherClear || targets.includes("grapher");
        refresh.context = refresh.all || targets.includes("context");

        let _this = this;
        let sidebar = $(".sidebar");

        if (refresh.sidebar) {
            sidebar.empty();
            this._show.getSheets().forEach(sheet => {
                let label = HTMLBuilder.span(sheet.getLabel(), "label");

                let preview = HTMLBuilder.div("preview");
                let $sheet = HTMLBuilder
                    .div("stuntsheet", [label, preview], sidebar)
                    .data("sheet", sheet);

                if (sheet === this._activeSheet) {
                    $sheet.addClass("active");
                }
            });
            sidebar.find(".stuntsheet.active").scrollIntoView({
                margin: 10,
            });
        }

        if (refresh.sidebarPreviews) {
            sidebar.find(".stuntsheet").each(function() {
                let sheet = $(this).data("sheet");
                let preview = $(this).find(".preview");

                // field preview
                let grapher = new Grapher(_this._show, preview, {
                    drawOrientation: false,
                    drawYardlines: false,
                    fieldPadding: 5,
                })
                grapher.draw(sheet);
            });
        }

        // refresh grapher
        if (refresh.grapher) {
            let selectedDots = this._selectedDots;
            if (refresh.grapherClear) {
                selectedDots = this.getSelectedDots().map(dot => dot.id);
                this._grapher.clear();
            }

            if (this._activeSheet) {
                this._grapher.draw(this._activeSheet, this._currBeat);
            } else {
                this._grapher.drawField();
            }

            // this._selectedDots will refer to stale dots after calling grapher.clear()
            if (refresh.grapherClear) {
                selectedDots = this._grapher.getDots(selectedDots);
            }

            this._grapher.selectDots(selectedDots);
            this._selectedDots = selectedDots;
        }

        // refresh context
        if (refresh.context && this._context) {
            this._context.refresh();
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
        let workspace = $(".workspace");
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

        this.refresh("grapherClear");
        if (this._context) {
            this._context.refreshZoom();
        }

        // scroll workspace to keep same location under cursor
        let end = this._grapher.getScale().toDistanceCoordinates(start);
        workspace.scrollLeft(end.x - left);
        workspace.scrollTop(end.y - top);

        // update toolbar
        let zoom = round(this._grapher.getOption("zoom"), 1e-3);
        let toolbarZoom = $(".toolbar .zoom-to select").choose(zoom);
        if (_.isNull(toolbarZoom.val())) {
            // custom zoom
            let label = (zoom * 100).toFixed(1);
            toolbarZoom.children("option.custom")
                .val(zoom)
                .text(`${label}%`);
            toolbarZoom.choose(zoom);
        }
    }

    /**
     * Revert any actions in the redo/undo history that satisfy the given
     * filter function.
     *
     * @param {function} predicate - The function that takes in the action
     *   object and returns true if the action should be undone (if in
     *   undoHistory) or discarded (if in redoHistory).
     */
    revertWhile(predicate) {
        _.remove(this._redoHistory, predicate);
        _.forEachRight(this._undoHistory, (action, i) => {
            if (predicate(action)) {
                action.undo.apply(action.context);
                this._undoHistory.splice(i, 1);
            }
        });
        this._updateHistory();
    }

    /**
     * Save the Show to the server.
     */
    saveShow() {
        let data = JSON.stringify(this._show.serialize());
        let params = {
            viewer: data,
        };

        doAction("save_show", params, {
            success: () => {
                showMessage("Saved!");
                this._savedShow = data;
            },
        });
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
     *   - {boolean} [append=true] - If false, deselect all dots before selecting.
     */
    selectDots(dots, options={}) {
        if (!_.defaultTo(options.append, true)) {
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

        this.selectDots(select);
        this.deselectDots(deselect);
    }

    /**
     * Undo the last action in history.
     */
    undo() {
        if (this._undoHistory.length === 0) {
            return;
        }

        let actionData = this._undoHistory.pop();
        actionData.undo.apply(actionData.context);

        this._redoHistory.push(actionData);
        this._updateHistory();
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

    /**
     * Get the action represented by the given parameter. Overriding
     * ApplicationController's _getAction to allow looking up methods
     * in EditorActions and the active Context.
     *
     * @param {string} name
     * @return {Object} An object of the form:
     *   {
     *       context: Object,
     *       function: function,
     *       args: ?Array,
     *       canUndo: boolean,
     *   }
     */
    _getAction(name) {
        let data = this._parseAction(name);

        function getAction(context, container, canUndo) {
            let action = container[data.name];
            if (_.isFunction(action)) {
                return {
                    name: data.name,
                    context: context,
                    function: action,
                    args: data.args,
                    canUndo: canUndo,
                };
            }
        };

        let action = (
            getAction(this, this, false) ||
            getAction(this, this.actions, true) ||
            getAction(this._context, this._context, false) ||
            getAction(this._context, this._context.actions, true)
        );

        if (_.isUndefined(action)) {
            throw new ActionError(`No action with the name: ${data.name}`);
        } else {
            return action;
        }
    }

    /**
     * Set up actions to initialize the sidebar
     */
    _setupSidebar() {
        let _this = this;
        let sidebar = $(".content .sidebar");
        let sidebarOffset = sidebar.offset();

        // sidebar context menus
        sidebar
            .contextmenu(function(e) {
                if ($(e.target).notIn(".stuntsheet")) {
                    showContextMenu(e, {
                        "Add Sheet...": "addStuntsheet",
                    });
                }
            })
            .on("contextmenu", ".stuntsheet", function(e) {
                $(this).click();

                showContextMenu(e, {
                    "Properties...": "editSheetProperties",
                    "Duplicate Sheet": "duplicateSheet",
                    "Delete Sheet": "deleteSheet",
                });
            });

        // sidebar clicks
        sidebar.on("click", ".stuntsheet", function(e) {
            let sheet = $(this).data("sheet");
            if (sheet !== _this._activeSheet) {
                _this.loadSheet(sheet);
            }
        });

        let oldIndex;
        sidebar.sortable({
            containment: ".sidebar",
            activate: (e, ui) => {
                oldIndex = ui.item.index();
            },
            update: (e, ui) => {
                let index = ui.item.index();
                _this.doAction("moveSheet", [oldIndex, index]);
            },
        });
    }

    /**
     * Update the Undo/Redo labels in the menu.
     */
    _updateHistory() {
        function updateLabel(action, history) {
            let li = $(`.controller-menu li[data-action=${action}]`);
            let span = li.find("span.label");
            let data = _.last(history);

            if (_.isUndefined(data)) {
                span.remove();
            } else {
                if (!span.exists()) {
                    span = HTMLBuilder.span("", "label").appendTo(li);
                }
                let label = _.defaultTo(data.label, _.lowerCase(data.name));
                span.text(` ${label}`);
            }
        }

        updateLabel("undo", this._undoHistory);
        updateLabel("redo", this._redoHistory);
    }
}

let EditorShortcuts = {
    "alt+n": "addStuntsheet", // can't capture ctrl+n: http://stackoverflow.com/a/7296303/4966649
    "ctrl+backspace": "deleteSheet",
    "ctrl+d": "duplicateSheet",
    "ctrl+shift+z": "redo",
    "ctrl+s": "saveShow",
    "ctrl+z": "undo",
};

/**
 * Contains all actions in the EditorController. Actions are any methods that modify
 * the Show and can be undone/redone. All actions must return an object containing:
 *   - {function} undo - The function that will undo this action. `this` will be
 *     set to the EditorController instance.
 *   - {Object} [data] - Optional data to pass to the redo function. Defaults
 *     to any arguments initially passed to the function.
 *   - {string} [label] - Optional label to use for the Undo/Redo menu item.
 *     Defaults to the spaced-out name of the action.
 *
 * Actions are also passed the EditorController instance as `this`. If an action returns
 * false, the action is cancelled (i.e. cannot be undone).
 */
class EditorActions {
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
        this._show.removeSheet(sheet);
        this.loadSheet(_.defaultTo(sheet.getPrevSheet(), sheet.getNextSheet()));
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

    /**
     * Save the Show properties.
     *
     * @param {Object} data - The data from the edit-show popup.
     */
    static saveShowProperties(data) {
        let changed = update(this._show, underscoreKeys(data));

        this._show.getSheets().forEach(function(sheet) {
            sheet.updateMovements();
        });
        this.checkContinuities();
        this.refresh();

        return {
            undo: function() {
                update(this._show, changed);
                this._show.getSheets().forEach(function(sheet) {
                    sheet.updateMovements();
                });
                this.refresh();
            },
        };
    }
}
