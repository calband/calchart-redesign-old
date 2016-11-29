/**
 * @fileOverview Defines the base EditorActions class that contains every action that can be
 *   run on the page.
 */

var CalchartUtils = require("../utils/CalchartUtils");

/**
 * A collection of actions that can be executed in the editor page.
 */
var EditorActions = {};

/**
 * Adds a new stuntsheet to the Show and sidebar.
 */
EditorActions.add_stuntsheet = function() {
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
            EditorActions.update_sidebar(stuntsheet);
            EditorActions.show_stuntsheet(stuntsheet);

            CalchartUtils.hidePopup(popup);
        },
    });
};

EditorActions.redo = function() {
    alert("redo called!");
};

/**
 * Saves the show to the server.
 */
EditorActions.save_show = function(callback) {
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
EditorActions.show_stuntsheet = function(stuntsheet) {
    $(".sidebar .active").removeClass("active");
    stuntsheet.addClass("active");
    CalchartUtils.scrollIfHidden(stuntsheet);

    var sheet = stuntsheet.data("sheet");
    // TODO: show sheet in workspace
};

EditorActions.undo = function() {
    alert("undo called!");
};

/**
 * Update the given stuntsheet in the sidebar. If no stuntsheet is given,
 * updates every stuntsheet in the sidebar. Use this function when needing
 * to relabel stuntsheets (after reordering) or when a stuntsheet's formation
 * changes.
 *
 * @param {jQuery|undefined} stuntsheet -- the stuntsheet to update in the sidebar
 */
EditorActions.update_sidebar = function(stuntsheet) {
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

module.exports = EditorActions;
