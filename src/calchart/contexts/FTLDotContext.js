import BaseContext from "calchart/contexts/BaseContext";

import HTMLBuilder from "utils/HTMLBuilder";
import { setupPanel } from "utils/UIUtils";

/**
 * The Context that allows a user to define the dot order in
 * a follow the leader continuity.
 */
export default class FTLDotContext extends BaseContext {
    constructor(controller) {
        super(controller);

        this._panel = $(".panel.ftl-dots");
        this._setupPanel();

        // string
        this._dotType = null;

        // int[]
        this._order = null;
    }

    static get actions() {
        return ContextActions;
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {string} dotType - The dot type to define the order for.
     *    - {int[]} order - The order of the dots.
     */
    load(options) {
        this._dotType = options.dotType;
        this._order = [];

        let show = this._controller.getShow();
        let list = this._panel.find(".ftl-dot-order").empty();
        options.order.forEach(id => {
            let dot = show.getDot(id);
            let graphDot = this._grapher.getDot(dot);
            let li = HTMLBuilder.li(dot.label, "dot")
                .appendTo(list)
                .mouseenter(() => {
                    this._grapher.selectDots(graphDot);
                })
                .mouseleave(() => {
                    this._grapher.deselectDots(graphDot);
                });
            this._order.push(li);
        });

        list.sortable({
            update: () => {
                // TODO: save changes action
            },
        });

        this._panel
            .show()
            .keepOnscreen();
    }

    unload() {
        super.unload();

        this._panel.hide();

        this._controller.loadContext("continuity", {
            unload: false,
            // load dot type
        });
    }

    refresh() {
        super.refresh();

        this._grapher.getDots(this._order).css("opacity", 1);

        // re-order dots on every refresh
        let list = this._panel.find(".ftl-dot-order");
        this._order.forEach(dot => {
            list.append(dot);
        });
    }

    refreshZoom() {
        this.refresh();
    }

    _setupPanel() {
        setupPanel(this._panel);

        this._panel.find("button.submit").click(() => {
            // TODO: validate order: dots next to each other
        });
    }
}

class ContextActions {
    // TODO
}
