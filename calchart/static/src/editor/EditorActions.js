/**
 * @fileOverview Defines the base EditorActions class that contains every action that can be
 *   run on the page.
 */

/**
 * A collection of actions that can be executed in the editor page.
 */
var EditorActions = {};

EditorActions.edit_undo = function() {
    alert("edit_undo called!");
};

EditorActions.edit_redo = function() {
    alert("edit_redo called!");
};

EditorActions.file_save = function() {
    alert("file_save called!");
};

EditorActions.new_stuntsheet = function() {
    alert("new_stuntsheet called!");
};

module.exports = EditorActions;
