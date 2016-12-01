/**
 * @fileOverview Defines the base EditorController class.
 */

var ApplicationController = require("../utils/ApplicationController");
var CalchartUtils = require("../utils/CalchartUtils");

/**
 * The class that stores the current state of the editor and contains all
 * of the actions that can be run in the editor page. This is a singleton
 * class, meaning that only one instance of this class will ever be created.
 * As a result, don't use this constructor directly; always get the
 * controller from EditorController.getInstance().
 */
var EditorController = function() {
    ApplicationController.apply(this);
};

ApplicationController.makeSubClass(EditorController);

/**
 * Adds a new stuntsheet to the Show and sidebar.
 */
EditorController.prototype.addStuntsheet = function() {
    CalchartUtils.showPopup("add-stuntsheet", {
        success: function(popup) {
            var container = $(this).parent();
            CalchartUtils.clearMessage(container);
            var data = CalchartUtils.getData(popup);

            // validate data
            data.num_beats = parseInt(data.num_beats);
            if (data.num_beats <= 0) {
                CalchartUtils.showError("Need to have a positive number of beats.", container);
                return;
            }

            var sheet = window.show.addSheet(data.num_beats);

            // containers for elements in sidebar
            var label = $("<span>").addClass("label");
            var preview = $("<svg>").addClass("preview");

            var stuntsheet = $("<div>")
                .addClass("stuntsheet")
                .data("sheet", sheet)
                .append(label)
                .append(preview)
                .appendTo(".sidebar");
            EditorController.update_sidebar(stuntsheet);
            EditorController.show_stuntsheet(stuntsheet);

            CalchartUtils.hidePopup(popup);
        },
    });
};

/**
 * Saves the show to the server.
 */
EditorController.prototype.saveShow = function(callback) {
    var params = {
        viewer: JSON.stringify(window.show.serialize()),
    };
    CalchartUtils.doAction("save_show", params, callback);
};

/**
 * Show the given stuntsheet in the sidebar and workspace.
 *
 * @param {jQuery} stuntsheet -- the stuntsheet element in the .sidebar
 */
EditorController.prototype.showStuntsheet = function(stuntsheet) {
    $(".sidebar .active").removeClass("active");
    stuntsheet.addClass("active");
    CalchartUtils.scrollIfHidden(stuntsheet);

    var sheet = stuntsheet.data("sheet");
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

    stuntsheets.each(function() {
        var sheet = $(this).data("sheet");

        var label = sheet.getLabel(window.show);
        $(this).find("span.label").text(label);

        // TODO: update preview
    });
};

module.exports = EditorController;
