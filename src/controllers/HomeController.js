import ApplicationController from "controllers/ApplicationController";
import CreateShowPopup from "popups/CreateShowPopup";

import HTMLBuilder from "utils/HTMLBuilder";

export default class HomeController extends ApplicationController {
    init() {
        super.init();

        // set up tabs
        $(".tabs li").click(function() {
            if ($(this).hasClass("active")) {
                return;
            }

            let tab = $(this).data("tab");

            $.ajax({
                data: {
                    tab: tab,
                },
                dataType: "json",
                success: data => {
                    $(".shows li").remove();
                    data.shows.forEach(show => {
                        HTMLBuilder.li(show.name)
                            .data("slug", show.slug)
                            .appendTo(".shows");
                    });

                    $(".tabs li.active").removeClass("active");
                    $(this).addClass("active");
                },
            });
        });

        $(".shows li").click(function() {
            let slug = $(this).data("slug");
            location.href = `/editor/${slug}`;
        });

        $(".main-buttons button.new-show").click(e => {
            new CreateShowPopup().show();
        });
    }
}
