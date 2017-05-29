import HomeController from "controllers/HomeController";

import "utils/jquery";

$(function() {
    if (_.isNull(window.show)) {
        alert("This show isn't set up yet!");
        return;
    }

    HomeController.init(null);
});
