import * as _ from "lodash";

import ApplicationController from "calchart/ApplicationController";
import Context from "calchart/Context";
import Dot from "calchart/Dot";
import Grapher from "calchart/Grapher";
import Sheet from "calchart/Sheet";

import { ActionError, AnimationStateError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { empty, parseArgs } from "utils/JSUtils";
import {
    doAction,
    showContextMenu,
    showPopup,
    getData,
    hidePopup,
    setupMenu,
    setupToolbar,
    showError,
    showMessage,
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

        this._grapher = new Grapher(this._show, $(".grapher-draw-target"), {
            showLabels: true,
            drawYardlineNumbers: true,
            draw4Step: true,
            drawDotType: true,
        });
        this._grapher.drawField();

        $(".content .sidebar")
            .contextmenu(function(e) {
                showContextMenu(e, {
                    "Add Sheet...": "addStuntsheet",
                });
            })
            .on("contextmenu", ".stuntsheet", function(e) {
                let sheet = $(this).data("sheet");
                controller.loadSheet(sheet);

                showContextMenu(e, {
                    "Duplicate Sheet": "duplicateSheet",
                    "Delete Sheet": "deleteSheet",
                    "Properties...": "showProperties",
                });

                return false;
            })
            .on("click", ".stuntsheet", function() {
                let sheet = $(this).data("sheet");

                // only load if the sheet isn't already loaded
                if (sheet !== this._activeSheet) {
                    controller.loadSheet(sheet);
                }
            });

        let sheet = _.first(this._show.getSheets());
        if (sheet) {
            this.loadSheet(sheet);
        }

        this.loadContext("dot");
    }

    /**
     * Show the popup that adds a stuntsheet to the Show
     */
    addStuntsheet() {
        let controller = this;
        showPopup("add-stuntsheet", {
            onSubmit: function(popup) {
                let data = getData(popup);

                // validate data

                if (data.num_beats == "") {
                    showError("Please provide the number of beats in the stuntsheet.");
                    return;
                }

                data.num_beats = parseInt(data.num_beats);
                if (data.num_beats <= 0) {
                    showError("Need to have a positive number of beats.");
                    return;
                }

                // hide popup and add sheet to show

                hidePopup();
                controller.doAction("addSheet", [data.num_beats]);
            },
        });
    }

    /**
     * Check if any of the given dots have continuity errors in the currently
     * active sheet, showing a UI error if so. Can also pass arguments in as
     * an Object of keyword arguments.
     *
     * @param {(Dot[]|Dot|string)} [dots] - The dots to check continuities of,
     *   the dot type of the dots to check, or all the dots by default.
     * @param {Sheet} [sheet] - The Sheet to check continuities for (defaults to
     *   currently active Sheet).
     * @param {boolean} [quiet=false] - if true, don't show a success message
     *   if there are no errors (default false).
     * @return {boolean} true if no errors in checking continuities
     */
    checkContinuities() {
        let args = parseArgs(arguments, ["dots", "sheet", "quiet"]);

        let sheet = _.defaultTo(args.sheet, this._activeSheet);
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
                    // ignore if no movements
                    if (sheet.getDotInfo(dot).movements.length !== 0) {
                        errors.lackMoves.push(dot.getLabel());
                    }
                    return;
                } else {
                    throw e;
                }
            }

            if (nextSheet) {
                let position = nextSheet.getPosition(dot);
                if (final.x !== position.x || final.y !== position.y) {
                    errors.wrongPosition.push(dot.getLabel());
                }
            }
        });

        let errorMessages = [];
        if (errors.lackMoves.length > 0) {
            errorMessages.push("Dots did not have enough to do: " + errors.lackMoves.join(", "));
        }
        if (errors.wrongPosition.length > 0) {
            errorMessages.push("Dots did not make it to their next spot: " + errors.wrongPosition.join(", "));
        }

        if (errorMessages.length > 0) {
            let label = sheet.getLabel();
            errorMessages.forEach(msg => {
                showError(`${msg} (SS ${label})`);
            });
            return false;
        } else if (!args.quiet) {
            showMessage("Continuities valid!");
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

        if (action.canUndo) {
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
     * Go to the zero-th beat of the sheet.
     */
    firstBeat() {
        this._currBeat = 0;
        this.refresh();
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
        this.refresh();
    }

    /**
     * Loads a Context for the application.
     *
     * @param {string} name - The name of the Context to load.
     * @param {Object} [options] - Any options to pass Context.load
     */
    loadContext(name, options) {
        if (this._context) {
            this._context.unload();
        }

        $("body").addClass(`context-${name}`);
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
            this.refresh();
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
            this.refresh();
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
     */
    refresh() {
        // refresh sidebar
        let sidebar = $(".sidebar").empty();
        this._show.getSheets().forEach(sheet => {
            let label = HTMLBuilder.span(sheet.getLabel(), "label");

            let preview = HTMLBuilder.div("preview");
            let $sheet = HTMLBuilder
                .div("stuntsheet", [label, preview], sidebar)
                .data("sheet", sheet);

            // field preview
            let grapher = new Grapher(this._show, preview, {
                drawOrientation: false,
                drawYardlines: false,
                fieldPadding: 5,
            })
            grapher.draw(sheet);

            if (sheet === this._activeSheet) {
                $sheet
                    .addClass("active")
                    .scrollIntoView({
                        margin: 10,
                    });
            }
        });

        // refresh grapher
        if (this._activeSheet) {
            this._grapher.draw(this._activeSheet, this._currBeat, this._selectedDots);
        }

        // refresh context
        if (this._context) {
            this._context.refresh();
        }
    }

    /**
     * Save the Show to the server.
     *
     * @param {function} [callback] - Optional callback to run after saving show. By default,
     *   shows a saved message.
     */
    saveShow(callback) {
        let data = this._show.serialize();
        let params = {
            viewer: JSON.stringify(data),
        };

        if (_.isUndefined(callback)) {
            callback = function() {
                showMessage("Saved!");
            }
        }

        doAction("save_show", params, callback);
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
 * Actions are also passed the EditorController instance as `this`.
 */
class EditorActions {
    /**
     * Add a Sheet to the Show.
     *
     * @param {int} numBeats - The number of beats for the stuntsheet.
     */
    static addSheet(numBeats) {
        let sheet = this._show.addSheet(numBeats);
        let prevSheet = sheet.getPrevSheet();
        if (prevSheet) {
            prevSheet.updateMovements();
        }
        this.loadSheet(sheet);

        return {
            undo: function() {
                this._show.removeSheet(sheet);
                if (prevSheet) {
                    prevSheet.updateMovements();
                }
                this.loadSheet(prevSheet);
            },
        };
    }

    /**
     * Delete the currently active Sheet.
     */
    static deleteSheet() {
        let sheet = this._activeSheet;
        let prevSheet = sheet.getPrevSheet();
        let nextSheet = sheet.getNextSheet();
        this._show.removeSheet(sheet);
        if (prevSheet) {
            prevSheet.updateMovements();
        }
        this.loadSheet(_.defaultTo(prevSheet, nextSheet));
        return {
            undo: function() {
                this._show.insertSheet(sheet, sheet.getIndex());
                if (prevSheet) {
                    prevSheet.updateMovements();
                }
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
        sheet.updateMovements();
        this.loadSheet(clone);

        return {
            data: [clone],
            undo: function() {
                this._show.removeSheet(clone);
                sheet.updateMovements();
                this.loadSheet(sheet);
            },
        };
    }
}
