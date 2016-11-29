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
 * Adds a new stuntsheet to the Show and workspace.
 */
EditorActions.new_stuntsheet = function() {
    var numBeats = 32;
    window.show.newSheet(numBeats);
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

EditorActions.undo = function() {
    alert("undo called!");
};

module.exports = EditorActions;
