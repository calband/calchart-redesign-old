import ApplicationController from "controllers/ApplicationController";
import CreateShowPopup from "popups/CreateShowPopup";

import HTMLBuilder from "utils/HTMLBuilder";

export default class HomeController extends ApplicationController {
    init() {
        super.init();

        // set up tabs
        $(".tabs").on("click", "li", e => {
            let tab = $(e.currentTarget);
            if (tab.hasClass("active")) {
                return;
            }

            let name = $(e.currentTarget).data("name");
            let activateTab = () => {
                $(".shows").hide();
                $(`.shows.${name}`).show();

                $(".tabs li.active").removeClass("active");
                tab.addClass("active");
            };

            if (!$(`.shows.${name}`).exists()) {
                $.ajax({
                    data: {
                        tab: name,
                    },
                    dataType: "json",
                    success: data => {
                        let items = data.shows.map(show =>
                            HTMLBuilder.li(show.name).data("slug", show.slug)
                        );

                        HTMLBuilder.make(`ul.shows.${name}`)
                            .append(items)
                            .appendTo(".content");

                        activateTab();
                    },
                });
            } else {
                activateTab();
            }
        });

        $(".shows").on("click", "li", e => {
            let slug = $(e.currentTarget).data("slug");
            location.href = `/editor/${slug}`;
        });

        $(".main-buttons button.new-show").click(e => {
            new CreateShowPopup().show();
        });
    }
}
