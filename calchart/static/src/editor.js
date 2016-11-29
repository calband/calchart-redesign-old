/**
 * @fileOverview The main Javascript file for the editor page.
 */

var Menu = require("./utils/Menu");
var Panel = require("./utils/Panel");
var EditorActions = require("./editor/EditorActions");
var Show = require("./calchart/Show");

$(document).ready(function() {
    Menu.setup(EditorActions);
    Panel.setup(EditorActions);

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
