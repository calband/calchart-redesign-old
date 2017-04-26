import BaseContext from "calchart/contexts/BaseContext";

import HTMLBuilder from "utils/HTMLBuilder";
import { setupPanel, showError } from "utils/UIUtils";

/**
 * The Context that allows a user to define the dot order in
 * a follow the leader continuity.
 */
export default class FTLDotContext extends BaseContext {
    constructor(controller) {
        super(controller);

        this._panel = $(".panel.ftl-dots");
        this._setupPanel();

        // FollowLeaderContinuity
        this._continuity = null;
    }

    static get actions() {
        return ContextActions;
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {FollowLeaderContinuity} continuity - The FTL continuity being edited
     */
    load(options) {
        this._continuity = options.continuity;
        let order = this._continuity.order;

        let show = this._controller.getShow();
        this._list = this._panel.find(".ftl-dot-order").empty();
        order.forEach(id => {
            let dot = show.getDot(id);
            let graphDot = this._grapher.getDot(dot);
            
            HTMLBuilder.li(dot.label, `dot dot-${id}`)
                .data("id", id)
                .appendTo(this._list)
                .mouseenter(() => {
                    this._grapher.selectDots(graphDot);
                })
                .mouseleave(() => {
                    this._grapher.deselectDots(graphDot);
                });
        });

        this._list.sortable({
            containment: this._panel,
            update: () => {
                let order = this._list.children().map(function() {
                    return $(this).data("id");
                }).get();
                controller.doAction("changeDotOrder", [order]);
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
            dotType: this._continuity.dotType,
        });
    }

    refresh() {
        super.refresh();

        let order = this._continuity.order;

        this._grapher.getDots(order).css("opacity", 1);

        // re-order dots on every refresh
        order.forEach(id => {
            let li = this._list.find(`li.dot-${id}`);
            this._list.append(li);
        });
    }

    _setupPanel() {
        setupPanel(this._panel);

        this._panel.find("button.submit").click(() => {
            this.unload();
        });
    }
}

class ContextActions {
    /**
     * Change the dot order to reflect the given order.
     *
     * @param {int[]} order
     * @param {FollowLeaderContinuity} [continuity=this._continuity]
     */
    static changeDotOrder(order, continuity=this._continuity) {
        let oldOrder = continuity.order;
        continuity.setOrder(order);
        continuity.sheet.updateMovements(continuity.dotType);
        this._controller.checkContinuities({
            dots: continuity.dotType,
        });
        this._controller.refresh();

        return {
            data: [order, continuity],
            undo: function() {
                continuity.setOrder(oldOrder);
                continuity.sheet.updateMovements(continuity.dotType);
                this._controller.refresh();
            },
        };
    }
}
