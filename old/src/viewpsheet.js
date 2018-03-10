import ViewpsheetController from "controllers/ViewpsheetController";

import "utils/jquery";

$(function() {
    if (_.isNull(window.show)) {
        alert("This show isn't set up yet!");
        return;
    }

    let controller = ViewpsheetController.init(window.show, window.dot, window.settings);
    controller.generate();
});

