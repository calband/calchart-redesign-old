import "utils/jquery";
import { hidePopup } from "utils/UIUtils";

$(function() {
    $("select").dropdown();

    $(".popup")
        .on("click", function(e) {
            if (!$(e.target).closest(".popup-box").exists()) {
                hidePopup();
            }
        })
        .on("click", ".popup-box button.cancel", function() {
            hidePopup();
        });

    // ESC closes active popups
    $(window).keydown(function(e) {
        if (e.which === 27) {
            hidePopup();
        }
    });
});
