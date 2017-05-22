import ViewerController from "calchart/controllers/ViewerController";
import Show from "calchart/Show";

import "utils/jquery";

if (_ === undefined) {
    console.error("lodash is not loaded!");
}

$(function() {
    if (_.isNull(window.show)) {
        alert("This show isn't set up yet!");
        return;
    }

    ViewerController.init(Show.deserialize(window.show));
});
