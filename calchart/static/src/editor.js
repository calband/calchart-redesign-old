var EditorController = require("calchart/controllers/EditorController");
var Grapher = require("calchart/Grapher");
var Show = require("calchart/Show");
var UIUtils = require("utils/UIUtils");

/**
 * Setup show, prompting user for show details if the show is new
 */
$(document).ready(function() {
    if (window.show !== null) {
        var show = new Show(window.show);
        var controller = EditorController.init(show);
        return;
    }

    UIUtils.showPopup("setup-show", {
        onSubmit: function(popup) {
            var data = UIUtils.getData(popup);

            // validate data

            if (data.num_dots === "") {
                UIUtils.showError("Please provide the number of dots in the show.");
                return;
            }

            data.num_dots = parseInt(data.num_dots);
            if (data.num_dots <= 0) {
                UIUtils.showError("Need to have a positive number of dots.");
                return;
            }

            if (data.dot_format === null) {
                data.dot_format = popup.find(".dot_format select option:first").val();
            }

            if (data.field_type === null) {
                data.field_type = popup.find(".field_type select option:first").val();
            }

            // save show and initialize controller

            var controller = EditorController.init(Show.create(data));
            controller.saveShow(function() {
                UIUtils.hidePopup();
            });
        },
    });
});
