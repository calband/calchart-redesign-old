/**
 * @fileOverview The main Javascript file for the editor page.
 */

var EditorMenu = require("./editor/EditorMenu");
var Show = require("./calchart/Show");

$(document).ready(function() {
    EditorMenu.setup();
    // convert show JSON data into Show object
    window.show = new Show(window.show);
});
