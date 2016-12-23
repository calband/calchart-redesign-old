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
var Grapher = require("calchart/Grapher");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
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
        _this._showStuntsheet(this);
    });

    var sheets = this._show.getSheets();
    for (var i = 0; i < sheets.length; i++) {
        this._addStuntsheetToSidebar(sheets[i]);
    }


    if (sheets.length > 0) {
        this._showStuntsheet($(".sidebar .stuntsheet").first());
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
            var container = $(popup).find(".buttons");
            UIUtils.clearMessages();
            var data = UIUtils.getData(popup);

            // validate data

            if (data.num_beats == "") {
                UIUtils.showError("Please provide the number of beats in the stuntsheet.", container);
                return;
            }

            data.num_beats = parseInt(data.num_beats);
            if (data.num_beats <= 0) {
                UIUtils.showError("Need to have a positive number of beats.", container);
                return;
            }

            // add sheet
            var sheet = _this._show.addSheet(data.num_beats);
            var stuntsheet = _this._addStuntsheetToSidebar(sheet);
            _this._showStuntsheet(stuntsheet);

            UIUtils.hidePopup(popup);
        },
    });
};
EditorController.prototype.addStuntsheet._canUndo = true;

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
 * Loads an editing context for the controller
 *
 * @param {string} name -- the name of the context to load
 */
EditorController.prototype.loadContext = function(name) {
    if (this._context) {
        this._context.unload();
    }

    $("body").addClass("context-" + name);
    this._context = Context.load(name, this._grapher, this._activeSheet);
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
 * @param {function|undefined} callback -- optional callback to run after saving show
 */
EditorController.prototype.saveShow = function(callback) {
    var data = this._show.serialize();
    var params = {
        viewer: JSON.stringify(data),
    };
    // TODO: add sbowing success message to callback
    UIUtils.doAction("save_show", params, callback);
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
 * Show the given stuntsheet in the sidebar and workspace.
 *
 * @param {jQuery} stuntsheet -- the stuntsheet element in the .sidebar
 */
EditorController.prototype._showStuntsheet = function(stuntsheet) {
    if ($(stuntsheet).hasClass("active")) {
        return;
    }

    // update sidebar
    $(".sidebar .active").removeClass("active");
    $(stuntsheet)
        .addClass("active")
        .scrollToView({
            margin: 10,
        });

    // update instance variables
    this._activeSheet = $(stuntsheet).data("sheet");
    this._currBeat = 0;

    // load sheet into necessary objects
    this._show.loadSheet(this._activeSheet);
    this._grapher.draw(this._activeSheet);
    if (this._context) {
        this._context.loadSheet(this._activeSheet);
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
