import Show from "calchart/Show";
import EditorController from "controllers/EditorController";
import SetupShowPopup from "popups/SetupShowPopup";

import "utils/jquery";

/**
 * Setup show, prompting user for show details if the show is new
 */
$(function() {
    if (window.show) {
        EditorController.init(Show.deserialize(window.show));
    } else {
        // controller initialized in onSave()
        new SetupShowPopup(window.showName, window.showSlug).show();
    }
});
