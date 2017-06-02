import ApplicationController from "controllers/ApplicationController";
import * as menus from "menus/HomeContextMenus";
import CreateShowPopup from "popups/CreateShowPopup";

import { IS_STUNT } from "utils/env";
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

            let tabName = $(e.currentTarget).data("name");
            let activateTab = () => {
                $(".shows").hide();
                $(`.shows.${tabName}`).show();

                $(".tabs li.active").removeClass("active");
                tab.addClass("active");
            };

            if (!$(`.shows.${tabName}`).exists()) {
                $.ajax({
                    data: {
                        tab: tabName,
                    },
                    dataType: "json",
                    success: data => {
                        let items = data.shows.map(show =>
                            HTMLBuilder.li(show.name, tabName).data("slug", show.slug)
                        );

                        HTMLBuilder.make(`ul.shows.${tabName}`)
                            .append(items)
                            .appendTo(".content");

                        activateTab();
                    },
                });
            } else {
                activateTab();
            }
        });

        $(".content")
            .on("click", ".shows li", e => {
                let show = $(e.currentTarget);
                let slug = show.data("slug");
                let app = show.hasClass("owned") || IS_STUNT ? "editor" : "viewer";
                this.openShow(app, slug, e.metaKey || e.ctrlKey);
            })
            .on("contextmenu", ".shows li", e => {
                new menus.ShowMenu(this, e).show();
            });

        $(".main-buttons button.new-show").click(e => {
            new CreateShowPopup().show();
        });
    }

    openShow(app, slug, newTab=false) {
        let url = `/${app}/${slug}`;
        if (newTab) {
            window.open(url, "_blank");
        } else {
            location.href = url;
        }
    }
}
