/**
 * @file All the context menus in the home page.
 */

import ContextMenu from "menus/ContextMenu";

import { IS_STUNT } from "utils/env";

export class ShowMenu extends ContextMenu {
    /**
     * @param {HomeController} controller
     * @param {Event} e
     */
    constructor(controller, e) {
        super(controller, e);
        this._show = $(e.currentTarget).addClass("active");
    }

    getItems() {
        let slug = this._show.data("slug");
        let items = [
            {
                label: "Open in viewer...",
                action: `openShow(viewer, ${slug})`,
            },
            {
                label: "Open in editor...",
                action: `openShow(editor, ${slug})`,
            },
        ];

        if (this._show.hasClass("band") && !IS_STUNT) {
            _.pullAt(items, 1);
        }

        return items;
    }

    close() {
        super.close();
        this._show.removeClass("active");
    }
}
