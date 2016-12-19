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

var ApplicationController = require("../ApplicationController");
var Context = require("../Context");
var Grapher = require("../Grapher");
var JSUtils = require("../../utils/JSUtils");
var UIUtils = require("../../utils/UIUtils");

// Global variable to track how much the workspace has scrolled
// when moving the dots
var scrollOffset = {
    top: 0,
    left: 0,
};

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
    this._selectedDots = $(); // dots selected to edit
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
        colorAngle: false,
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

    this.loadContext("default");
};

/**** INSTANCE METHODS ****/

EditorController.prototype.shortcuts = {
    "ctrl+s": "saveShow",
    "ctrl+z": "undo",
    "ctrl+shift+z": "redo",
};

/**
 * @return {jQuery} the currently selected dots
 */
EditorController.prototype.getSelectedDots = function() {
    return this._selectedDots;
};

/**
 * Allow retrieving shortcuts from the context also
 */
EditorController.prototype.getShortcut = function(shortcut) {
    var _function = ApplicationController.prototype.getShortcut.call(this, shortcut);
    if (_function === undefined && this._context !== null) {
        return this._context.shortcuts[shortcut];
    } else {
        return _function;
    }
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
 * Deselects all dots.
 */
EditorController.prototype.deselectDots = function() {
    $(".dot-marker.selected").attr("class", "dot-marker");
    this._selectedDots = $();
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

    var data = action.apply(this, _action.args);

    if (canUndo) {
        var label = action._name || JSUtils.fromCamelCase(name);
        var actionData = {
            name: name,
            label: label,
            content: prevContent,
            data: data,
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
    this._context = Context.load(name, this._grapher);
};

/**
 * Move all selected dots the given amount
 *
 * @param {float} deltaX -- the amount to move in the x direction, in pixels
 * @param {float} deltaY -- the amount to move in the y direction, in pixels
 * @param {object} options -- options to pass to BaseGrapher.moveDot()
 */
EditorController.prototype.moveSelection = function(deltaX, deltaY, options) {
    var _this = this;
    options.transition = true;

    var prevScroll = {
        top: $(".workspace").scrollTop(),
        left: $(".workspace").scrollLeft(),
    };

    this._selectedDots
        .each(function() {
            var position = $(this).data("position");
            _this._grapher.moveDot(
                this,
                position.x + deltaX + scrollOffset.left,
                position.y + deltaY + scrollOffset.top,
                options
            );
        })
        .scrollToView(".workspace", {
            tolerance: 10,
        });

    scrollOffset.top += $(".workspace").scrollTop() - prevScroll.top;
    scrollOffset.left += $(".workspace").scrollLeft() - prevScroll.left;
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
        actionData.redo.call(this, actionData.data);
    } else {
        this.doAction(actionData.name, true);
    }

    this._undoHistory.push(actionData);
};

/**
 * Save the positions of all selected dots, both in the Grapher and in the Sheet
 */
EditorController.prototype.saveSelectionPositions = function() {
    var _this = this;
    var scale = this._grapher.getScale();
    var dots = [];

    this._selectedDots.each(function() {
        // for undo/redo-ing
        var dotData = {
            selector: "#" + $(this).attr("id"),
            before: $(this).data("position"),
        };

        var position = _this._grapher.savePosition(this);
        var x = scale.toSteps(position.x - scale.minX);
        var y = scale.toSteps(position.y - scale.minY);
        _this._activeSheet.updatePosition(this, x, y);

        dotData.after = $(this).data("position");
        dots.push(dotData);
    });

    scrollOffset.top = 0;
    scrollOffset.left = 0;

    return {
        dots: dots,
        sheet: this._activeSheet,
    };
};
EditorController.prototype.saveSelectionPositions._name = "Move dots";
EditorController.prototype.saveSelectionPositions._undo = function(data) {
    this._revertMoveDots(data, true);
};
EditorController.prototype.saveSelectionPositions._redo = function(data) {
    this._revertMoveDots(data, false);
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
 * Add the given dot to the list of selected dots
 *
 * @param {jQuery} dot -- the dot to select
 * @param {boolean} addToSelection -- if true, add the dot to the list of selected
 *   dots, if not already selected. If false and the dot is not already selected,
 *   deselect all currently selected dots.
 */
EditorController.prototype.selectDot = function(dot, addToSelection) {
    if (this._selectedDots.filter(dot).exists()) {
        return;
    } else if (!addToSelection) {
        this.deselectDots();
    }

    this._selectedDots = this._selectedDots.add(dot);
    $(dot).find(".dot-marker").attr("class", "dot-marker selected");
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
        actionData.undo.call(this, actionData.data);
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
    var label = $("<span>").addClass("label");
    var preview = $("<svg>").addClass("preview");

    var stuntsheet = $("<div>")
        .addClass("stuntsheet")
        .data("sheet", sheet)
        .append(label)
        .append(preview)
        .appendTo(".sidebar");

    this._updateSidebar(stuntsheet);
    return stuntsheet;
};

/**
 * A helper function to revert saveSelectionPositions (both for undo or redo),
 * since undo-ing should actually also revert moving the dots (not just saving
 * the positions).
 *
 * @param {object} data -- the data returned from saveSelectionPositions
 * @param {boolean} isUndo -- true to undo the function, false to redo
 */
EditorController.prototype._revertMoveDots = function(data, isUndo) {
    var selectedDots = $();
    var scale = this._grapher.getScale();

    data.dots.forEach(function(dot) {
        var elem = $(dot.selector);
        var position = isUndo ? dot.before : dot.after;

        this._grapher.moveDot(elem, position.x, position.y);

        var x = scale.toSteps(position.x - scale.minX);
        var y = scale.toSteps(position.y - scale.minY);
        data.sheet.updatePosition(elem, x, y);

        selectedDots = selectedDots.add(elem);
    }, this);

    this._selectedDots = selectedDots;
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
    this.deselectDots();

    // load sheet into Show and Grapher
    this._show.loadSheet(this._activeSheet);
    this._grapher.draw(this._activeSheet);
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
