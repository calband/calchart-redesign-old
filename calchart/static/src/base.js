var jQueryUtils = require("utils/jQueryUtils");
var UIUtils = require("utils/UIUtils");

jQueryUtils(jQuery);

$(document).ready(function() {
    $("select").dropdown();

    $(".popup-box button.cancel").click(function() {
        var popup = $(this).parents(".popup-box");
        UIUtils.hidePopup(popup);
    });
});
