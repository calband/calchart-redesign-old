import HiddenContext from "calchart/contexts/HiddenContext";

import HTMLBuilder from "utils/HTMLBuilder";
import { setupPanel } from "utils/UIUtils";

/**
 * The Context that allows a user to define a dot order in
 * a continuity that requires dots to be in order.
 */
export default class ContinuityDotContext extends HiddenContext {
    constructor(controller) {
        super(controller);

        this._panel = $(".panel.edit-continuity-dots");
        this._list = this._panel.find(".dot-order");
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
        super.load(options);

        this._continuity = options.continuity;
        let order = this._continuity.order;

        let show = this._controller.getShow();
        this._list.empty();
        order.forEach(id => {
            let dot = show.getDot(id);
            let graphDot = this._grapher.getDot(dot);
            
            HTMLBuilder.li(dot.label, `dot dot-${id}`)
                .data("id", id)
                .appendTo(this._list)
                .mouseenter(e => {
                    this._controller.selectDots(graphDot);
                })
                .mouseleave(e => {
                    this._controller.deselectDots(graphDot);
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

        this._grapher.getDots(this._continuity.order).css("opacity", "");

        this._controller.checkContinuities({
            dots: this._continuity.dotType,
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

    exit() {
        this._controller.loadContext("continuity", {
            dotType: this._continuity.dotType,
        });
    }

    _setupPanel() {
        setupPanel(this._panel);

        this._panel.find("button.flip").click(() => {
            this._controller.doAction("reverseDotOrder");
        });

        this._panel.find("button.submit").click(() => {
            this.exit();
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

    /**
     * Reverse the dot order.
     *
     * @param {FollowLeaderContinuity} [continuity=this._continuity]
     */
    static reverseDotOrder(continuity=this._continuity) {
        continuity.order.reverse();
        continuity.sheet.updateMovements(continuity.dotType);
        this._controller.refresh();

        return {
            data: [continuity],
            undo: function() {
                continuity.order.reverse();
                continuity.sheet.updateMovements(continuity.dotType);
                this._controller.refresh();
            },
        };
    }
}
