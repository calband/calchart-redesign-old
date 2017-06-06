import ViewpsheetController from "controllers/ViewpsheetController";

import "utils/jquery";

$(function() {
    if (_.isNull(window.show)) {
        alert("This show isn't set up yet!");
        return;
    }

    let controller = ViewpsheetController.init(window.show);
    let dot = controller.show.getDot(window.dot);
    if (dot) {
        controller.setDots([dot]);
    }
});

