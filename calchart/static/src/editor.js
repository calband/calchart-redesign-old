/**
 * @fileOverview The main Javascript file for the editor page.
 */

var EditorMenu = require("./editor/EditorMenu");
var Show = require("./calchart/Show");

$(document).ready(function() {
    EditorMenu.setup();
    // convert show JSON data into Show object
    window.show = new Show(window.show);

    // adjust content so that it only takes up to the bottom of the
    // screen (and not extending below the screen)
    var offset = parseInt($("body").css("padding-top"))
        + $("header").outerHeight(true)
        + $(".toolbar").outerHeight();
    $(".content")
        .css({
            top: offset,
            height: "calc(100% - " + offset + "px)",
        });
});
