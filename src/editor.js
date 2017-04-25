import EditorController from "calchart/controllers/EditorController";
import Show from "calchart/Show";

import { ValidationError } from "utils/errors";
import "utils/jquery";
import { getData, showPopup } from "utils/UIUtils";

if (_ === undefined) {
    console.error("lodash is not loaded!");
}

/**
 * Setup show, prompting user for show details if the show is new
 */
$(function() {
    if (!_.isUndefined(window.show)) {
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
                throw new ValidationError("Please provide the number of dots in the show.");
            } else if (data.numDots <= 0) {
                throw new ValidationError("Need to have a positive number of dots.");
            }

            // save show and initialize controller

            let show = Show.create(window.showName, window.showSlug, data);
            let controller = EditorController.init(show);
            controller.saveShow();
        },
    });
});
