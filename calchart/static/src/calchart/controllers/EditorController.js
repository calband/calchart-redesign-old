/**
 * @fileOverview This file defines the EditorController, the singleton instance that
 * controls the entire editor application. Functions defined by the EditorController
 * are organized alphabetically in the following sections:
 *
 * - Constructors (including initialization functions)
 * - Instance methods
 * - Actions
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

    $(".content .sidebar").on("click", ".stuntsheet", function() {
        var sheet = $(this).data("sheet");
        _this.loadSheet(sheet);
    });

    this.loadContext("dot");

    var sheets = this._show.getSheets();
    if (sheets.length > 0) {
        this.loadSheet(sheets[0]);
    } else {
        this.refresh();
    }
};

/**** INSTANCE METHODS ****/

EditorController.prototype.shortcuts = {
    "ctrl+s": "saveShow",
    "ctrl+z": "undo",
    "ctrl+shift+z": "redo",
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
 * Refresh the UI according to the current state of the editor
 * and Show
 */
EditorController.prototype.refresh = function() {
    // refresh sidebar
    $(".sidebar").empty();
    this._show.getSheets().forEach(function(sheet) {
        var label = HTMLBuilder.span(sheet.getLabel(), "label");
        var preview = HTMLBuilder.make("svg.preview");

        var $sheet = HTMLBuilder
            .div("stuntsheet", [label, preview], ".sidebar")
            .data("sheet", sheet);

        if (sheet === this._activeSheet) {
            $sheet
                .addClass("active")
                .scrollToView({
                    margin: 10,
                });
        }
    }, this);

    // refresh grapher
    if (this._activeSheet) {
        this._grapher.draw(this._activeSheet, this._currBeat);
    } else {
        this._grapher.drawField();
    }

    this._context.refresh();
};

/**** ACTIONS
 *
 * Each action can define the following properties:
 *  - {string} _name: the verbose name of the action, used for Undo text or other labels
 *    (default to name of action, capitalized and spaced out)
 *  - {boolean} _canUndo: set true to indicate that the action can be undone (default true
 *    if _undo is defined, otherwise false)
 *  - {boolean} _clearsRedo: if true, when the action is run, clears history of actions
 *    that have been undone (default same as _canUndo)
 *  - {function} _undo: the function to run instead of the default undo function, which
 *    replaces the .content element with a clone saved from before the initial call
 *  - {function} _redo: the function to run instead of the default redo function, which
 *    simply calls the function again
 *
 * Example:
 *
 * EditorController.prototype.addStuntsheet = function() { ... };
 * EditorController.prototype.addStuntsheet._name = "Add a Stuntsheet";
 * EditorController.prototype.addStuntsheet._canUndo = true;
 *
 ****/

/**
 * Adds a new stuntsheet to the Show and sidebar.
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

            // add sheet
            var sheet = _this._show.addSheet(data.num_beats);
            _this.loadSheet(sheet);

            UIUtils.hidePopup(popup);
        },
    });
};
EditorController.prototype.addStuntsheet._canUndo = true;

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
        var dots = sheet.getDotType(args.dots);
    } else if (args.dots instanceof Dot) {
        var dots = [args.dots];
    } else {
        var dots = args.dots;
    }

    var errors = {
        lackMoves: [],
        wrongPosition: [],
    };

    dots.forEach(function(dot) {
        try {
            var final = dot.getAnimationState(duration, sheet);
        } catch (e) {
            // ignore if no movements
            if (sheet.getInfoForDot(dot).movements.length !== 0) {
                errors.lackMoves.push(dot.getLabel());
            }
            return;
        }

        var position = nextSheet.getInfoForDot(dot).position;
        if (final.x !== position.x || final.y !== position.y) {
            errors.wrongPosition.push(dot.getLabel());
        }
    });

    var errorMessages = [];
    if (errors.lackMoves.length > 0) {
        errorMessages.push("Dots did not have enough to do: " + errors.lackMoves.join(", "));
    }
    if (errors.wrongPosition.length > 0) {
        errorMessages.push("Dots did not make it to their next spot: " + errors.wrongPosition.join(", "));
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
 * Runs the method on this instance with the given name.
 *
 * @param {string} name -- the function to call
 * @param {boolean} asRedo -- true if calling from a redo action
 */
EditorController.prototype.doAction = function(name, asRedo) {
    var _action = this._getAction(name);
    var action = _action.function;

    var canUndo = action._canUndo || action._undo;
    var prevContent = $(".content").clone(true);

    // after doing an action, can't redo previous actions
    if (!asRedo && (action._clearsRedo || (action._clearsRedo === undefined && canUndo))) {
        JSUtils.empty(this._redoHistory);
    }

    var data = action.apply(_action.context, _action.args);

    if (canUndo) {
        var label = action._name || JSUtils.fromCamelCase(name);
        var actionData = {
            name: name,
            label: label,
            content: prevContent,
            data: data,
            context: _action.context,
            undo: action._undo,
            redo: action._redo,
        };

        // TODO: show label in undo menu item
        this._undoHistory.push(actionData);
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
 */
EditorController.prototype.loadContext = function(name) {
    if (this._context) {
        this._context.unload();
    }

    $("body").addClass("context-" + name);
    this._context = Context.load(name, this);
};

/**
 * Load the given stuntsheet, either a stuntsheet in the sidebar
 * or a Sheet object
 *
 * @param {jQuery} sheet -- the sheet to load
 */
EditorController.prototype.loadSheet = function(sheet) {
    // only load if the sheet isn't already loaded
    if (sheet === this._activeSheet) {
        return;
    }

    // update state
    this._activeSheet = sheet;
    this._currBeat = 0;
    this._show.loadSheet(sheet);

    this.refresh();

    // disable continuity context if sheet is the last sheet
    if (sheet.isLastSheet()) {
        $(".toolbar .edit-continuity").addClass("disabled");
    } else {
        $(".toolbar .edit-continuity").removeClass("disabled");
    }
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

    if (actionData.redo) {
        actionData.redo.call(actionData.context, actionData.data);
    } else {
        this.doAction(actionData.name, true);
    }

    this._undoHistory.push(actionData);
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
 * Set the current beat to the given beat
 *
 * @param {int} beat -- the beat to set to
 */
EditorController.prototype.setBeat = function(beat) {
    this._currBeat = beat;
};

/**
 * Restores the state of the application to the previous state
 */
EditorController.prototype.undo = function() {
    if (this._undoHistory.length === 0) {
        return;
    }

    var actionData = this._undoHistory.pop();

    if (actionData.undo) {
        actionData.undo.call(actionData.context, actionData.data);
    } else {
        $(".content")
            .after(actionData.content)
            .remove();
        this._grapher.rebindSVG();
    }

    this._redoHistory.push(actionData);
};

/**** HELPERS ****/

/**
 * Parses the given function name according to menus.py
 *
 * Overriding ApplicationController's _getAction to allow looking up
 * actions in the active Context
 *
 * @param {string} name -- the function name, optionally with arguments
 * @return {object} an object of the form
 *   {
 *       context: object,
 *       function: function,
 *       args: Array<string|float>,
 *   }
 */
EditorController.prototype._getAction = function(name) {
    try {
        var action = ApplicationController.prototype._getAction.call(this, name);
        action.context = this;
        return action;
    } catch (e) {
        if (!(e instanceof errors.ActionError)) {
            throw e;
        }

        var _function = this._context[e.data.name];
        if (_function === undefined) {
            throw new errors.ActionError("No action with the name: " + e.data.name, e.data);
        }

        return {
            context: this._context,
            function: _function,
            args: e.data.args,
        };
    }
};

/**
 * Allow retrieving shortcuts from the context also
 */
EditorController.prototype._getShortcut = function(shortcut) {
    var action = ApplicationController.prototype._getShortcut.call(this, shortcut);
    if (action === undefined) {
        return this._context.shortcuts[shortcut];
    } else {
        return action;
    }
};

module.exports = EditorController;
