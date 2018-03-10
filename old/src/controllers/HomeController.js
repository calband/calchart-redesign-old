import PublishShowAction from "actions/PublishShowAction";
import ApplicationController from "controllers/ApplicationController";
import * as menus from "menus/HomeContextMenus";
import CreateShowPopup from "popups/CreateShowPopup";

import { IS_STUNT } from "utils/env";
import HTMLBuilder from "utils/HTMLBuilder";

// map tab name to the jQuery list of shows
let shows = {};

export default class HomeController extends ApplicationController {
    init() {
        super.init();

        window.tabs.forEach(([name, label]) => {
            HTMLBuilder.li(label)
                .data("name", name)
                .click(e => {
                    let tab = $(e.currentTarget);
                    if (!tab.hasClass("active")) {
                        $(".tabs li.active").removeClass("active");
                        tab.addClass("active");
                        this.loadTab(name);
                    }
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
        $(".shows > *").hide();
        let $show = shows[tab];

        if ($show) {
            $show.show();
        } else {
            $(".shows .loading").show();

            $.ajax({
                data: {
                    tab: tab,
                },
                dataType: "json",
                success: data => {
                    let showList;
                    if (tab === "band" && IS_STUNT) {
                        showList = HTMLBuilder.div();
                        let unpublished = [];
                        let published = [];
                        data.shows.forEach(show => {
                            let li = HTMLBuilder.li(show.name, show.slug)
                                .data("type", tab)
                                .data("slug", show.slug)
                                .data("published", show.published);
                            if (show.published) {
                                published.push(li);
                            } else {
                                unpublished.push(li);
                            }
                        });
                        HTMLBuilder.make("h2.unpublished", "Unpublished")
                            .appendTo(showList);
                        HTMLBuilder.make("ul.show-list")
                            .append(unpublished)
                            .appendTo(showList);
                        HTMLBuilder.make("h2.published", "Published")
                            .appendTo(showList);
                        HTMLBuilder.make("ul.show-list")
                            .append(published)
                            .appendTo(showList);
                        shows[tab] = showList;
                    } else {
                        showList = HTMLBuilder.make("ul.show-list");
                        data.shows.forEach(show => {
                            HTMLBuilder.li(show.name, show.slug)
                                .data("type", tab)
                                .data("slug", show.slug)
                                .appendTo(showList);
                        });
                    }
                    showList.appendTo(".shows");
                    shows[tab] = showList;

                    $(".shows .loading").hide();
                },
            });
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
            window.location.href = url;
        }
    }

    /**
     * Publish/unpublish the given show.
     *
     * @param {boolean} publish - true to publish, false to unpublish
     * @param {string} slug - The slug of the show to publish
     */
    publishShow(publish, slug) {
        new PublishShowAction().send({ publish, slug });
    }
}
