var UIUtils = require("./utils/UIUtils");

(function($) {
    /**
    * Convert a <select> element into a fancy dropdown. We use the Chosen library
    * (http://harvesthq.github.io/chosen/) to convert the selects and we style it
    * on our own in _mixins.scss. In order to support re-initializing Chosen dropdowns,
    * use this function to destroy any existing Chosen elements before initializing.
    *
    * @param {Object} options -- additional options to pass to the Chosen
    *      constructor, which override any defaults we set for all dropdowns.
    *      The full list of Chosen options can be found at
    *      https://harvesthq.github.io/chosen/options.html
    * @return {jQuery} this
    */
    $.fn.dropdown = function(options) {
        if (this.length > 1) {
            return this.each(function() {
                $(this).dropdown(options);
            });
        }
        // set default options
        var defaults = {
            placeholder_text_single: "------",
            disable_search_threshold: 10,
            search_contains: true,
        };
        options = $.extend(defaults, options);

        // destroy Chosen if exists
        if (this.data("chosen") !== undefined) {
            this.chosen("destroy");
        }

        return this.chosen(options);
    };
}(jQuery));

$(document).ready(function() {
    $("select:visible").dropdown();

    $(".popup-box button.cancel").click(function() {
        var popup = $(this).parents(".popup-box");
        UIUtils.hidePopup(popup);
    });
});
