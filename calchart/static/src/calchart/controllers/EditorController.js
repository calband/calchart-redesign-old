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
    this._grapher.drawField();

    $(".content .sidebar").on("click", ".stuntsheet", function() {
        _this.loadSheet(this);
    });

    var sheets = this._show.getSheets();
    for (var i = 0; i < sheets.length; i++) {
        this._addStuntsheetToSidebar(sheets[i]);
    }


    if (sheets.length > 0) {
        this.loadSheet($(".sidebar .stuntsheet").first());
    }

    this.loadContext("dot");
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
            var stuntsheet = _this._addStuntsheetToSidebar(sheet);
            _this.loadSheet(stuntsheet);

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
    this.refreshGrapher();
};

/**
 * Go to the last beat of the sheet
 */
EditorController.prototype.lastBeat = function() {
    this._currBeat = this._activeSheet.getDuration();
    this.refreshGrapher();
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
 * @param {Sheet|jQuery} sheet -- the sheet to load
 */
EditorController.prototype.loadSheet = function(sheet) {
    var $sheet = $(sheet);
    if (sheet instanceof Sheet) {
        $(".sidebar .stuntsheet").each(function() {
            var _sheet = $(this).data("sheet");
            if (_sheet === sheet) {
                $sheet = $(this);
                return false;
            }
        });
    } else {
        sheet = $sheet.data("sheet");
    }

    // only load if the sheet isn't already loaded
    if (sheet === this._activeSheet) {
        return;
    }

    // update sidebar
    $(".sidebar .active").removeClass("active");
    $sheet
        .addClass("active")
        .scrollToView({
            margin: 10,
        });

    // update instance variables
    this._activeSheet = sheet;
    this._currBeat = 0;

    // load sheet into necessary objects
    this._show.loadSheet(sheet);
    this._grapher.draw(sheet);
    if (this._context) {
        this._context.loadSheet(sheet);
    }

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
        this.refreshGrapher();
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
        this.refreshGrapher();
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
 * Redraw the Grapher with the currently active stuntsheet and
 * current beat
 */
EditorController.prototype.refreshGrapher = function() {
    this._grapher.draw(this._activeSheet, this._currBeat);
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
    this.refreshGrapher();
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
 * Add the given Sheet to the sidebar
 *
 * @param {Sheet} sheet -- the Sheet to add
 * @return {jQuery} the stuntsheet added to the sidebar
 */
EditorController.prototype._addStuntsheetToSidebar = function(sheet) {
    // containers for elements in sidebar
    var label = HTMLBuilder.make("span.label");
    var preview = HTMLBuilder.make("svg.preview");

    var stuntsheet = HTMLBuilder
        .div("stuntsheet", [label, preview], ".sidebar")
        .data("sheet", sheet);

    this._updateSidebar(stuntsheet);
    return stuntsheet;
};

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
    var action = this._parseAction(name);
    var context = this;

    var _function = this[action.name];
    // try looking in the context
    if (_function === undefined) {
        _function = this._context[action.name];
        context = this._context;
    }
    // action not found in controller or context
    if (_function === undefined) {
        throw new Error("No action with the name: " + action.name);
    }

    return {
        context: context,
        function: _function,
        args: action.args,
    };
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

/**
 * Update the given stuntsheet in the sidebar. If no stuntsheet is given,
 * updates every stuntsheet in the sidebar. Use this function when needing
 * to relabel stuntsheets (after reordering) or when a stuntsheet's formation
 * changes.
 *
 * @param {jQuery|undefined} stuntsheet -- the stuntsheet to update in the sidebar
 */
EditorController.prototype._updateSidebar = function(stuntsheet) {
    if (stuntsheet === undefined) {
        var stuntsheets = $(".sidebar .stuntsheet");
    } else {
        var stuntsheets = $(stuntsheet);
    }

    var show = this._show;
    stuntsheets.each(function() {
        var sheet = $(this).data("sheet");

        var label = sheet.getLabel(show);
        $(this).find("span.label").text(label);

        // TODO: update preview
    });
};

module.exports = EditorController;
