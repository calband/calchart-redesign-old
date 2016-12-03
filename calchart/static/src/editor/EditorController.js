var ApplicationController = require("../calchart/ApplicationController");
var Grapher = require("../calchart/Grapher");
var JSUtils = require("../utils/JSUtils");
var UIUtils = require("../utils/UIUtils");

/**
 * The class that stores the current state of the editor and contains all
 * of the actions that can be run in the editor page.
 *
 * @param {Show} show -- the show being edited in the application
 */
var EditorController = function(show) {
    ApplicationController.call(this, show);

    this._grapher = null;
    this._selectedDots = []; // dots selected to edit
    this._activeSheet = null;
    this._currBeat = null;
};

JSUtils.extends(EditorController, ApplicationController);

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
 * Initializes the editor application
 */
EditorController.prototype.init = function() {
    var _this = this;
    this._setupMenu(".menu");
    this._setupPanel(".panel");

    this._grapher = new Grapher(this._show, $(".grapher-draw-target"));
    this._grapher.draw();

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
};

/**
 * Saves the show to the server
 *
 * @param {function|undefined} callback -- optional callback to run after saving show
 */
EditorController.prototype.saveShow = function(callback) {
    var data = this.getShow().serialize();
    var params = {
        viewer: JSON.stringify(data),
    };
    UIUtils.doAction("save_show", params, callback);
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

    $(".sidebar .active").removeClass("active");
    $(stuntsheet).addClass("active");
    UIUtils.scrollIfHidden(stuntsheet);

    this._activeSheet = $(stuntsheet).data("sheet");
    this._currBeat = 0;

    this._show.loadSheet(this._activeSheet);
    this._grapher.draw(this._activeSheet, this._currBeat, this._selectedDots);
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
