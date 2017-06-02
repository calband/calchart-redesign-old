import ApplicationController from "controllers/ApplicationController";
import * as menus from "menus/HomeContextMenus";
import CreateShowPopup from "popups/CreateShowPopup";

import { IS_STUNT } from "utils/env";
import HTMLBuilder from "utils/HTMLBuilder";

export default class HomeController extends ApplicationController {
    init() {
        super.init();

        window.tabs.forEach(([name, label]) => {
            HTMLBuilder.li(label, name)
                .click(e => {
                    this.loadTab(name);
                })
                .appendTo(".tabs");
        });
        $(".tabs li:first").click();

        $(".shows")
            .on("click", "li", e => {
                let show = $(e.currentTarget);
                let slug = show.data("slug");
                let type = show.data("type");
                let app = type === "owned" || IS_STUNT ? "editor" : "viewer";
                this.openShow(app, slug, e.metaKey || e.ctrlKey);
            })
            .on("contextmenu", "li", e => {
                new menus.ShowMenu(this, e).show();
            });

        $(".main-buttons button.new-show").click(e => {
            new CreateShowPopup().show();
        });
    }

    /**** METHODS ****/

    /**
     * Load the given tab.
     *
     * @param {string} tab - The name of the tab to load.
     */
    loadTab(tab) {
        let $tab = $(`.tabs li.${tab}`);
        if ($tab.hasClass("active")) {
            return;
        }

        let activateTab = () => {
            $(".show-list").hide();
            $(`.show-list.${tab}`).show();

            $(".tabs li.active").removeClass("active");
            $tab.addClass("active");
        };

        if (!$(`.show-list.${tab}`).exists()) {
            let showList = HTMLBuilder.make(`ul.show-list.${tab}`)
                .appendTo(".shows");

            $.ajax({
                data: {
                    tab: tab,
                },
                dataType: "json",
                success: data => {
                    data.shows.forEach(show => {
                        HTMLBuilder.li(show.name)
                            .data("type", tab)
                            .data("slug", show.slug)
                            .appendTo(showList);
                    });
                    activateTab();
                },
            });
        } else {
            activateTab();
        }
    }

    /**
     * Open the given show in the given app.
     *
     * @param {string} app - The application to load, "viewer" or "editor"
     * @param {string} slug - The slug of the show to open
     * @param {boolean} [newTab=false] - true to open the show in a new tab
     */
    openShow(app, slug, newTab=false) {
        let url = `/${app}/${slug}`;
        if (newTab) {
            window.open(url, "_blank");
        } else {
            location.href = url;
        }
    }
}
