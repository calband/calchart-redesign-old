import ViewerController from "viewer/ViewerController";

import "utils/jquery";

$(function() {
    if (_.isNull(window.show)) {
        alert("This show isn't set up yet!");
        return;
    }

    ViewerController.init(window.show);
});
