import "utils/jquery";
import * as UIUtils from "utils/UIUtils";

$(function() {
    $("select").dropdown();

    $(".popup")
        .on("click", function(e) {
            if (!$(e.target).closest(".popup-box").exists()) {
                UIUtils.hidePopup();
            }
        })
        .on("click", ".popup-box button.cancel", function() {
            UIUtils.hidePopup();
        });

    // ESC closes active popups
    $(window).keydown(function(e) {
        if (e.which === 27) {
            UIUtils.hidePopup();
        }
    });
});
