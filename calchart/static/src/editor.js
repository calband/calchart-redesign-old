/**
 * @fileOverview The main Javascript file for the editor page.
 */

var Show = require("./calchart/Show");
var EditorController = require("./editor/EditorController");
var CalchartUtils = require("./utils/CalchartUtils");

$(document).ready(function() {
    // convert JSON show data into Show object
    setupShow();

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

/**
 * Convert JSON show data into a Show object. If the Show is new,
 * prompt user for information needed to set up the Show, including:
 *  - number of dots
 */
var setupShow = function() {
    if (window.show !== null) {
        window.show = new Show(window.show);
        return;
    }

    CalchartUtils.showPopup("setup-show", {
        success: function(popup) {
            var container = $(this).parent();
            CalchartUtils.clearMessage(container);
            var data = CalchartUtils.getData(popup);

            // validate data
            data.num_dots = parseInt(data.num_dots);
            if (data.num_dots <= 0) {
                CalchartUtils.showError("Need to have a positive number of dots.", container);
                return;
            }

            window.show = Show.create(data);
            EditorActions.save_show(function() {
                CalchartUtils.hidePopup("setup-show");
            });
        },
    });
};
