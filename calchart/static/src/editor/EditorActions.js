var CalchartUtils = require("../utils/CalchartUtils");

/**
 * Contains all of the actions that can modify the editor application.
 */
var EditorActions = {};

/**
 * Adds a new stuntsheet to the Show and sidebar.
 */
EditorActions.addStuntsheet = {
    name: "Add Stuntsheet",
    canUndo: true,
    do: function(controller) {
        CalchartUtils.showPopup("add-stuntsheet", {
            onSubmit: function(popup) {
                var container = $(popup).find(".buttons");
                CalchartUtils.clearMessages();
                var data = CalchartUtils.getData(popup);

                // validate data

                if (data.num_beats == "") {
                    CalchartUtils.showError("Please provide the number of beats in the stuntsheet.", container);
                    return;
                }

                data.num_beats = parseInt(data.num_beats);
                if (data.num_beats <= 0) {
                    CalchartUtils.showError("Need to have a positive number of beats.", container);
                    return;
                }

                // add sheet

                var sheet = controller.getShow().addSheet(data.num_beats);

                // containers for elements in sidebar
                var label = $("<span>").addClass("label");
                var preview = $("<svg>").addClass("preview");

                var stuntsheet = $("<div>")
                    .addClass("stuntsheet")
                    .data("sheet", sheet)
                    .append(label)
                    .append(preview)
                    .appendTo(".sidebar");

                controller.updateSidebar(stuntsheet);
                controller.showStuntsheet(stuntsheet);

                CalchartUtils.hidePopup(popup);
            },
        });
    },
};

/**
 * Redoes the last undone action
 */
EditorActions.redo = {
    name: "Redo",
    canUndo: false,
    do: function(controller) {
        controller.redo();
    },
};

/**
 * Saves the show to the server.
 *
 * @param {function|undefined} callback -- optional callback to run after saving show
 */
EditorActions.saveShow = {
    name: "Save Show",
    canUndo: false,
    do: function(controller, callback) {
        var data = controller.getShow().serialize();
        var params = {
            viewer: JSON.stringify(data),
        };
        CalchartUtils.doAction("save_show", params, callback);
    },
};

/**
 * Restores the state of the application to the previous state
 */
EditorActions.undo = {
    name: "Undo",
    canUndo: false,
    do: function(controller) {
        controller.undo();
    },
};

module.exports = EditorActions;
