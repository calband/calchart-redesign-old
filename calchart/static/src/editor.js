import * as _ from "lodash";

import EditorController from "calchart/controllers/EditorController";
import Show from "calchart/Show";

import "utils/jquery";
import { getData, showError, showPopup } from "utils/UIUtils";

/**
 * Setup show, prompting user for show details if the show is new
 */
$(function() {
    if (!_.isNull(window.show)) {
        EditorController.init(Show.deserialize(window.show));
        return;
    }

    showPopup("setup-show", {
        init: function(popup) {
            // dropdowns converted in EditorController.init(); not converted yet
            popup.find("select").dropdown();
        },
        onSubmit: function(popup) {
            let data = getData(popup);

            // validate data

            data.numDots = parseInt(data.numDots);
            if (_.isNaN(data.numDots)) {
                showError("Please provide the number of dots in the show.");
                return false;
            } else if (data.numDots <= 0) {
                showError("Need to have a positive number of dots.");
                return false;
            }

            // save show and initialize controller

            let controller = EditorController.init(Show.create(data));
            controller.saveShow();
        },
    });
});
