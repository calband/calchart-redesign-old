var CalchartUtils = require("./utils/CalchartUtils");
var EditorController = require("./editor/EditorController");
var Grapher = require("./calchart/Grapher");
var Show = require("./calchart/Show");

/**
 * Setup show, prompting user for show details if the show is new
 */
$(document).ready(function() {
    if (window.show !== null) {
        var show = new Show(window.show);
        var controller = new EditorController(show);
        controller.init();
        return;
    }

    CalchartUtils.showPopup("setup-show", {
        onSubmit: function(popup) {
            var container = $(popup).find(".buttons");
            CalchartUtils.clearMessages();
            var data = CalchartUtils.getData(popup);

            // validate data

            if (data.num_dots === "") {
                CalchartUtils.showError("Please provide the number of dots in the show.", container);
                return;
            }

            data.num_dots = parseInt(data.num_dots);
            if (data.num_dots <= 0) {
                CalchartUtils.showError("Need to have a positive number of dots.", container);
                return;
            }

            if (data.dot_format === null) {
                CalchartUtils.showError("Please provide the format of the dot labels.", container);
                return;
            }

            if (data.field_type === null) {
                CalchartUtils.showError("Please provide the field type.", container);
                return;
            }

            // save show and initialize controller

            var controller = new EditorController(Show.create(data));
            controller.init();
            controller.saveShow(function() {
                CalchartUtils.hidePopup("setup-show");
            });
        },
    });
});
