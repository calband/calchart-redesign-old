var Menu = require("../utils/Menu");

var EditorMenu = {};
$.extend(EditorMenu, Menu);

EditorMenu.file_save = function() {
    alert("file_save called!");
};

EditorMenu.edit_undo = function() {
    alert("edit_undo called!");
};

EditorMenu.edit_redo = function() {
    alert("edit_redo called!");
};

module.exports = EditorMenu;
