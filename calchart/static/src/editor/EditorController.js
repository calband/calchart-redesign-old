/**
 * @fileOverview Defines the EditorController class.
 */

var ApplicationController = require("../utils/ApplicationController");
var CalchartUtils = require("../utils/CalchartUtils");
var Grapher = require("../calchart/Grapher");
var EditorActions = require("./EditorActions");
var JSUtils = require("../utils/JSUtils");

/**
 * The class that stores the current state of the editor and contains all
 * of the actions that can be run in the editor page.
 *
 * @param {Show} show -- the show being edited in the application
 */
var EditorController = function(show) {
    ApplicationController.call(this, show, EditorActions);
};

JSUtils.extends(EditorController, ApplicationController);

/**
 * Initializes the editor application
 */
EditorController.prototype.init = function() {
    this._setupMenu(".menu");
    this._setupPanel(".panel");

    this._grapher = new Grapher(this._show.getFieldType(), $(".grapher-draw-target"));

    $(".content .sidebar").on("click", ".stuntsheet", function() {
        controller.showStuntsheet(this);
    });
};

/**
 * Saves the show to the server
 *
 * @param {function|undefined} callback -- optional callback to run after saving show
 */
EditorController.prototype.saveShow = function(callback) {
    this._actions.saveShow.do(this, callback);
};

/**
 * Show the given stuntsheet in the sidebar and workspace.
 *
 * @param {jQuery} stuntsheet -- the stuntsheet element in the .sidebar
 */
EditorController.prototype.showStuntsheet = function(stuntsheet) {
    if ($(stuntsheet).hasClass("active")) {
        return;
    }

    $(".sidebar .active").removeClass("active");
    $(stuntsheet).addClass("active");
    CalchartUtils.scrollIfHidden(stuntsheet);

    var sheet = $(stuntsheet).data("sheet");
    // TODO: show sheet in workspace
};

/**
 * Update the given stuntsheet in the sidebar. If no stuntsheet is given,
 * updates every stuntsheet in the sidebar. Use this function when needing
 * to relabel stuntsheets (after reordering) or when a stuntsheet's formation
 * changes.
 *
 * @param {jQuery|undefined} stuntsheet -- the stuntsheet to update in the sidebar
 */
EditorController.prototype.updateSidebar = function(stuntsheet) {
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
