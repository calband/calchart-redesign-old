/**
 * @fileOverview This file defines the EditorController, the singleton instance that
 * controls the entire editor application. Functions defined by the EditorController
 * are organized alphabetically in the following sections:
 *
 * - Constructors (including initialization functions)
 * - Instance methods
 * - Actions (anything that modifies the Show and can be undone)
 * - Helpers (prefixed with an underscore)
 */

var ApplicationController = require("calchart/ApplicationController");
var Context = require("calchart/Context");
var Dot = require("calchart/Dot");
var errors = require("calchart/errors");
var Grapher = require("calchart/Grapher");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
var Sheet = require("calchart/Sheet");
var UIUtils = require("utils/UIUtils");

/**** CONSTRUCTORS ****/

/**
 * The class that stores the current state of the editor and contains all
 * of the actions that can be run in the editor page. (details in the
 * actions section below)
 *
 * @param {Show} show -- the show being edited in the application
 */
var EditorController = function(show) {
    ApplicationController.call(this, show);

    this._grapher = null;
    this._context = null;
    this._activeSheet = null;
    this._currBeat = null;
    this._selectedDots = $(); // dots selected to edit, used with DotContext

    this._undoHistory = [];
    this._redoHistory = [];
};

ApplicationController.extend(EditorController);

/**
 * Initializes the editor application
 */
EditorController.prototype.init = function() {
    ApplicationController.prototype.init.call(this);

    var _this = this;
    this._setupMenu(".menu");
    this._setupToolbar(".toolbar");

    var grapherOptions = {
        showLabels: true,
        drawYardlineNumbers: true,
        draw4Step: true,
        drawDotType: true,
    };
    this._grapher = new Grapher(this._show, $(".grapher-draw-target"), grapherOptions);
    this._grapher.drawField();

    $(".content .sidebar")
        .contextmenu(function(e) {
            UIUtils.showContextMenu(e, {
                "Add Sheet...": "addStuntsheet",
            });
        })
        .on("contextmenu", ".stuntsheet", function(e) {
            var sheet = $(this).data("sheet");
            _this.loadSheet(sheet);

            UIUtils.showContextMenu(e, {
                "Duplicate Sheet": "duplicateSheet",
                "Delete Sheet": "deleteSheet",
                "Properties...": "showProperties",
            });

            return false;
        })
        .on("click", ".stuntsheet", function() {
            var sheet = $(this).data("sheet");

            // only load if the sheet isn't already loaded
            if (sheet !== this._activeSheet) {
                _this.loadSheet(sheet);
            }
        });

    var sheets = this._show.getSheets();
    if (sheets.length > 0) {
        this.loadSheet(sheets[0]);
    }

    this.loadContext("dot");
};

/**** INSTANCE METHODS ****/

EditorController.prototype.shortcuts = {
    "alt+n": "addStuntsheet", // can't capture ctrl+n: http://stackoverflow.com/a/7296303/4966649
    "ctrl+backspace": "deleteSheet",
    "ctrl+shift+z": "redo",
    "ctrl+s": "saveShow",
    "ctrl+z": "undo",
};

/**
 * Shows the popup that adds a stuntsheet to the Show
 */
EditorController.prototype.addStuntsheet = function() {
    var _this = this;
    UIUtils.showPopup("add-stuntsheet", {
        onSubmit: function(popup) {
            var data = UIUtils.getData(popup);

            // validate data

            if (data.num_beats == "") {
                UIUtils.showError("Please provide the number of beats in the stuntsheet.");
                return;
            }

            data.num_beats = parseInt(data.num_beats);
            if (data.num_beats <= 0) {
                UIUtils.showError("Need to have a positive number of beats.");
                return;
            }

            // hide popup and add sheet to show

            UIUtils.hidePopup();
            _this.doAction("addSheet", [data.num_beats]);
        },
    });
};

/**
 * Check if any of the given dots have continuity errors in the currently
 * active sheet, showing a UI error if so.
 *
 * @param {string|Array<Dot>|Dot|undefined} dots -- the dots to check
 *   continuities of, the dot type of the dots to check, or all the
 *   dots by default
 * @param {Sheet|undefined} sheet -- the Sheet to check continuities for (default
 *   currently active Sheet)
 * @param {boolean|undefined} quiet -- if true, don't show a success message
 *   if there are no errors (default false)
 * @return {boolean} true if no errors in checking continuities
 */
EditorController.prototype.checkContinuities = function() {
    var args = JSUtils.parseArgs(arguments, ["dots", "sheet", "quiet"]);

    var sheet = args.sheet || this._activeSheet;
    var duration = sheet.getDuration();
    var nextSheet = sheet.getNextSheet();

    if (args.dots === undefined) {
        var dots = this._show.getDots();
    } else if (typeof args.dots === "string") {
        var dots = sheet.getDotsOfType(args.dots);
    } else if (args.dots instanceof Dot) {
        var dots = [args.dots];
    } else {
        var dots = args.dots;
    }

    var moveErrors = {
        lackMoves: [],
        wrongPosition: [],
    };

    dots.forEach(function(dot) {
        try {
            var final = sheet.getAnimationState(dot, duration);
        } catch (e) {
            if (e instanceof errors.AnimationStateError) {
                // ignore if no movements
                if (sheet.getDotInfo(dot).movements.length !== 0) {
                    moveErrors.lackMoves.push(dot.getLabel());
                }
            } else {
                throw e;
            }
            return;
        }

        if (nextSheet) {
            var position = nextSheet.getDotInfo(dot).position;
            if (final.x !== position.x || final.y !== position.y) {
                moveErrors.wrongPosition.push(dot.getLabel());
            }
        }
    });

    var errorMessages = [];
    if (moveErrors.lackMoves.length > 0) {
        errorMessages.push("Dots did not have enough to do: " + moveErrors.lackMoves.join(", "));
    }
    if (moveErrors.wrongPosition.length > 0) {
        errorMessages.push("Dots did not make it to their next spot: " + moveErrors.wrongPosition.join(", "));
    }

    if (errorMessages.length > 0) {
        var sheetInfo = " (SS " + sheet.getLabel() + ")";
        errorMessages.forEach(function(msg) {
            UIUtils.showError(msg + sheetInfo);
        });
        return false;
    } else if (!args.quiet) {
        UIUtils.showMessage("Continuities valid!");
        return true;
    }
};

/**
 * Deselects the given dots. If no dots are given, deselects all dots.
 *
 * @param {jQuery|undefined} dots -- dots to deselect (defaults to all dots)
 */
EditorController.prototype.deselectDots = function(dots) {
    if (dots === undefined) {
        dots = this._selectedDots;
    }

    this._selectedDots = this._selectedDots.not(dots);
    this._grapher.deselectDots(dots);
};

/**
 * Runs the method on this instance with the given name.
 *
 * The method can either be an instance method or an action. An action is
 * anything that modifies the Show. All actions can be undone and redone.
 * All other methods (things that update the controller, context, etc.) are
 * instance methods.
 *
 * @param {string} name -- the function to call (see _parseAction)
 * @param {Array|undefined} args -- arguments to pass to the action. Can also
 *   be passed in name (see _parseAction), which will override any arguments
 *   passed in as a parameter
 */
EditorController.prototype.doAction = function(name, args) {
    var action = this._getAction(name);
    action.args = action.args || args || [];

    var data = action.function.apply(action.context, action.args);

    if (action.canUndo) {
        var actionData = $.extend({}, data, action);
        // if data was returned from the action, use it for redos instead
        // of the initial args
        actionData.args = data.data || action.args;
        this._undoHistory.push(actionData);

        // after doing an action, can't redo previous actions
        JSUtils.empty(this._redoHistory);
    }
};

/**
 * Go to the zero-th beat of the sheet
 */
EditorController.prototype.firstBeat = function() {
    this._currBeat = 0;
    this.refresh();
};

/**
 * Get the currently active Sheet
 *
 * @param {Sheet} the active sheet
 */
EditorController.prototype.getActiveSheet = function() {
    return this._activeSheet;
};

/**
 * Get the current beat number
 *
 * @param {int} the current beat
 */
EditorController.prototype.getCurrentBeat = function() {
    return this._currBeat;
};

/**
 * @return {Grapher} the grapher for the workspace
 */
EditorController.prototype.getGrapher = function() {
    return this._grapher;
};

/**
 * @return {jQuery} the selected dots
 */
EditorController.prototype.getSelection = function() {
    return this._selectedDots;
};

/**
 * @return {Array<Dot>} the selected dots as Dot objects
 */
EditorController.prototype.getSelectedDots = function() {
    return this._selectedDots.map(function() {
        return $(this).data("dot");
    }).toArray();
};

/**
 * Go to the last beat of the sheet
 */
EditorController.prototype.lastBeat = function() {
    this._currBeat = this._activeSheet.getDuration();
    this.refresh();
};

/**
 * Loads an editing context for the controller
 *
 * @param {string} name -- the name of the context to load
 * @param {object|undefined} options -- any options to pass Context.load
 */
EditorController.prototype.loadContext = function(name, options) {
    if (this._context) {
        this._context.unload();
    }

    $("body").addClass("context-" + name);
    this._context = Context.load(name, this, options);
    this.refresh();
};

/**
 * Load the given stuntsheet, either a stuntsheet in the sidebar
 * or a Sheet object
 *
 * @param {jQuery} sheet -- the sheet to load
 */
EditorController.prototype.loadSheet = function(sheet) {
    // update state
    this._activeSheet = sheet;
    this._currBeat = 0;

    this.refresh();
};

/**
 * Increment the current beat
 */
EditorController.prototype.nextBeat = function() {
    this._currBeat++;
    var duration = this._activeSheet.getDuration();

    if (this._currBeat > duration) {
        this._currBeat = duration;
    } else {
        this.refresh();
    }
};

/**
 * Decrement the current beat
 */
EditorController.prototype.prevBeat = function() {
    this._currBeat--;

    if (this._currBeat < 0) {
        this._currBeat = 0;
    } else {
        this.refresh();
    }
};

/**
 * Redoes the last undone action
 */
EditorController.prototype.redo = function() {
    if (this._redoHistory.length === 0) {
        return;
    }

    var actionData = this._redoHistory.pop();
    newData = actionData.function.apply(actionData.context, actionData.args);
    // update undo function
    actionData.undo = newData.undo;

    this._undoHistory.push(actionData);
};

/**
 * Refresh the UI according to the current state of the editor
 * and Show
 */
EditorController.prototype.refresh = function() {
    // refresh sidebar
    var sidebar = $(".sidebar").empty();
    this._show.getSheets().forEach(function(sheet) {
        var label = HTMLBuilder.span(sheet.getLabel(), "label");

        var preview = HTMLBuilder.div("preview");
        var options = {
            drawOrientation: false,
            drawYardlines: false,
            fieldPadding: 5,
        };

        var $sheet = HTMLBuilder
            .div("stuntsheet", [label, preview], sidebar)
            .data("sheet", sheet);

        // field preview
        new Grapher(this._show, preview, options).draw(sheet, 0, $());

        if (sheet === this._activeSheet) {
            $sheet
                .addClass("active")
                .scrollIntoView({
                    margin: 10,
                });
        }
    }, this);

    // refresh grapher
    if (this._activeSheet) {
        this._grapher.draw(this._activeSheet, this._currBeat, this._selectedDots);
    }

    // refresh context
    if (this._context) {
        this._context.refresh();
    }
};

/**
 * Saves the show to the server
 *
 * @param {function|undefined} callback -- optional callback to run after saving
 *   show. By default, shows a saved message.
 */
EditorController.prototype.saveShow = function(callback) {
    var data = this._show.serialize();
    var params = {
        viewer: JSON.stringify(data),
    };

    if (callback === undefined) {
        callback = function() {
            UIUtils.showMessage("Saved!");
        }
    }

    UIUtils.doAction("save_show", params, callback);
};

/**
 * Select all dots in the graph
 */
EditorController.prototype.selectAll = function() {
    this.selectDots(this._grapher.getDots());
};

/**
 * Add the given dots to the list of selected dots
 *
 * @param {jQuery} dots -- the dots to select
 * @param {object|undefined} options -- optional dictionary with the given options:
 *   - {boolean} append -- if false, deselect all dots before selecting (default true)
 */
EditorController.prototype.selectDots = function(dots, options) {
    options = options || {};

    if (options.append === false) {
        this.deselectDots();
    }

    this._selectedDots = this._selectedDots.add(dots);
    this._grapher.selectDots(this._selectedDots);
};

/**
 * Set the current beat to the given beat
 *
 * @param {int} beat -- the beat to set to
 */
EditorController.prototype.setBeat = function(beat) {
    this._currBeat = beat;
};

/**
 * For each dot, if it's selected, deselect it; otherwise, select it.
 *
 * @param {jQuery} dots -- the dots to toggle selection
 */
EditorController.prototype.toggleDots = function(dots, options) {
    var select = dots.not(this._selectedDots);
    var deselect = dots.filter(this._selectedDots);

    this.selectDots(select);
    this.deselectDots(deselect);
};

/**
 * Restores the state of the application to the previous state
 */
EditorController.prototype.undo = function() {
    if (this._undoHistory.length === 0) {
        return;
    }

    var actionData = this._undoHistory.pop();
    actionData.undo.apply(actionData.context);
    this._redoHistory.push(actionData);
};

/**** ACTIONS ****/

/**
 * Contains all actions in the EditorController. Actions are any methods that modify
 * the Show and can be undone/redone. All actions must return an object containing:
 *   - {function} undo -- the function that will undo this action. `this` will be
 *     set to the EditorController instance
 *   - {undefined|object} data -- optional data to pass to the redo function. Defaults
 *     to any arguments initially passed to the function
 *   - {undefined|string} label -- optional label to use for the Undo/Redo menu item.
 *     Defaults to the name of the action, capitalized and spaced out
 *
 * Actions are also passed the EditorController instance as `this`.
 */
var EditorActions = {};

/**
 * Adds a Sheet to the Show
 *
 * @this {EditorController}
 * @param {int} numBeats -- the number of beats for the stuntsheet
 */
EditorActions.addSheet = function(numBeats) {
    var sheet = this._show.addSheet(numBeats);
    var prevSheet = sheet.getPrevSheet();
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
};

/**
 * Deletes the currently active sheet
 */
EditorActions.deleteSheet = function() {
    var sheet = this._activeSheet;
    var prevSheet = sheet.getPrevSheet();
    var nextSheet = sheet.getNextSheet();
    this._show.removeSheet(sheet);
    if (prevSheet) {
        prevSheet.updateMovements();
    }
    this.loadSheet(prevSheet || nextSheet);
    return {
        undo: function() {
            this._show.insertSheet(sheet, sheet.getIndex());
            if (prevSheet) {
                prevSheet.updateMovements();
            }
            this.loadSheet(sheet);
        },
    };
};

EditorController.prototype._actions = EditorActions;

/**** HELPERS ****/

/**
 * Get the action represented by the given parameter
 *
 * Overriding ApplicationController's _getAction to allow looking up
 * methods in EditorActions and the active Context.
 *
 * @param {string} name -- the function name (see _parseAction)
 * @return {object} an object of the form
 *   {
 *       context: object,
 *       function: function,
 *       args: Array|null,
 *       canUndo: boolean,
 *   }
 */
EditorController.prototype._getAction = function(name) {
    var data = this._parseAction(name);

    var getAction = function(context, container, canUndo) {
        var action = container[data.name];
        if (typeof action === "function") {
            return {
                context: context,
                function: action,
                args: data.args,
                canUndo: canUndo,
            };
        }
    };

    var action = (
        getAction(this, this, false) ||
        getAction(this, this._actions, true) ||
        getAction(this._context, this._context, false) ||
        getAction(this._context, this._context.actions, true)
    );

    if (action === undefined) {
        throw new errors.ActionError("No action with the name: " + data.name);
    } else {
        return action;
    }
};

/**
 * Allow retrieving shortcuts from the context also
 */
EditorController.prototype._getShortcut = function(shortcut) {
    var action = ApplicationController.prototype._getShortcut.call(this, shortcut);
    return action || this._context.shortcuts[shortcut];
};

module.exports = EditorController;
