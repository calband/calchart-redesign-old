/**
 * @fileOverview The main Javascript file for the editor page.
 */

var CalchartUtils = require("./utils/CalchartUtils");
var EditorController = require("./editor/EditorController");
var Show = require("./calchart/Show");

/**
 * Setup show, prompting user for show details if the show is new
 */
$(document).ready(function() {
    if (window.show !== null) {
        var show = new Show(window.show);
        var controller = new EditorController(show);
        onInit(controller);
        return;
    }

    CalchartUtils.showPopup("setup-show", {
        onSubmit: function(popup) {
            var container = $(popup).find(".buttons");
            CalchartUtils.clearMessages();
            var data = CalchartUtils.getData(popup);

            // validate data
            data.num_dots = parseInt(data.num_dots);
            if (data.num_dots <= 0) {
                CalchartUtils.showError("Need to have a positive number of dots.", container);
                return;
            }

            var controller = new EditorController(Show.create(data));
            EditorController.saveShow(function() {
                CalchartUtils.hidePopup("setup-show");
                onInit(controller);
            });
        },
    });
});

/**
 * Actions to run after the show has been loaded and the EditorController
 * has been set up.
 */
var onInit = function(controller) {
    controller.setupMenu(".menu");
    controller.setupPanel(".panel");

    $(".content .sidebar").on("click", ".stuntsheet", function() {
        controller.showStuntsheet(this);
    });
};
