import * as _ from "lodash";

import EditorController from "calchart/controllers/EditorController";
import Show from "calchart/Show";

import { getData, hidePopup, showError, showPopup } from "utils/UIUtils";

/**
 * Setup show, prompting user for show details if the show is new
 */
$(function() {
    if (!_.isNull(window.show)) {
        let show = new Show(window.show);
        EditorController.init(show);
        return;
    }

    showPopup("setup-show", {
        onSubmit: function(popup) {
            let data = getData(popup);

            // validate data

            if (data.num_dots === "") {
                showError("Please provide the number of dots in the show.");
                return;
            }

            data.num_dots = parseInt(data.num_dots);
            if (data.num_dots <= 0) {
                showError("Need to have a positive number of dots.");
                return;
            }

            if (_.isNull(data.dot_format)) {
                data.dot_format = popup.find(".dot_format select option:first").val();
            }

            if (_.isNull(data.field_type)) {
                data.field_type = popup.find(".field_type select option:first").val();
            }

            // save show and initialize controller

            let controller = EditorController.init(Show.create(data));
            controller.saveShow(function() {
                hidePopup();
            });
        },
    });
});
