import HiddenGraphContext from "editor/contexts/HiddenContext";

import HTMLBuilder from "utils/HTMLBuilder";
import { setupPanel } from "utils/UIUtils";

/**
 * The Context that allows a user to define a dot order in
 * a continuity that requires dots to be in order.
 */
export default class ContinuityDotContext extends HiddenGraphContext {
    constructor(controller) {
        super(controller);

        this._setupPanel();

        // OrderedDotsContinuity
        this._continuity = null;
    }

    static get actions() {
        return ContextActions;
    }

    static get info() {
        return {
            name: "continuity-dots",
        };
    }

    static get refreshTargets() {
        return super.refreshTargets.concat(["panel"]);
    }

    get panel() {
        return $(".panel.edit-continuity-dots");
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {OrderedDotsContinuity} continuity - The continuity being edited
     */
    load(options) {
        super.load(options);

        this._continuity = options.continuity;

        let list = this.panel.find(".dot-order").empty();
        this._continuity.getOrder().forEach(dot => {
            let $dot = this.grapher.getDot(dot);
            
            HTMLBuilder.li(dot.label, `dot dot-${dot.id}`)
                .data("dot", dot)
                .appendTo(list)
                .mouseenter(e => {
                    this.selectDots($dot);
                })
                .mouseleave(e => {
                    this.deselectDots($dot);
                });
        });

        list.sortable({
            containment: this.panel,
            update: () => {
                let order = list.children().map(function() {
                    return $(this).data("dot");
                }).get();
                controller.doAction("changeDotOrder", [order]);
            },
        });

        this.panel.show().keepOnscreen();
    }

    unload() {
        super.unload();

        this.panel.hide();

        this._getGraphDots().css("opacity", "");

        this.checkContinuities({
            dots: this._continuity.dotType,
        });
    }

    refreshGrapher() {
        super.refreshGrapher();

        this._getGraphDots().css("opacity", 1);
    }

    refreshPanel() {
        let order = this._continuity.getOrder().map(dot => dot.id);
        let list = this.panel.find(".dot-order");

        // re-order dots on every refresh
        order.forEach(id => {
            let li = list.find(`li.dot-${id}`);
            list.append(li);
        });
    }

    exit() {
        this.controller.loadContext("continuity", {
            dotType: this._continuity.dotType,
        });
    }

    /**** HELPERS ****/

    /**
     * @param {jQuery}
     */
    _getGraphDots() {
        return this.grapher.getDots(this._continuity.getOrder());
    }

    _setupPanel() {
        setupPanel(this.panel);

        this.panel.find("button.flip").click(e => {
            this.controller.doAction("reverseDotOrder");
        });

        this.panel.find("button.submit").click(e => {
            this.exit();
        });
    }
}

class ContextActions extends HiddenGraphContext.actions {
    /**
     * Change the dot order to reflect the given order.
     *
     * @param {Dot[]} order
     * @param {OrderedDotsContinuity} [continuity=this._continuity]
     */
    static changeDotOrder(order, continuity=this._continuity) {
        let oldOrder = continuity.getOrder();
        continuity.setOrder(order);
        continuity.sheet.updateMovements(continuity.dotType);
        this.refresh("panel");

        return {
            data: [order, continuity],
            undo: function() {
                continuity.setOrder(oldOrder);
                continuity.sheet.updateMovements(continuity.dotType);
                this.refresh("panel");
            },
        };
    }

    /**
     * Reverse the dot order.
     *
     * @param {OrderedDotsContinuity} [continuity=this._continuity]
     */
    static reverseDotOrder(continuity=this._continuity) {
        continuity.reverseOrder();
        continuity.sheet.updateMovements(continuity.dotType);
        this.refresh("panel");

        return {
            data: [continuity],
            undo: function() {
                continuity.reverseOrder();
                continuity.sheet.updateMovements(continuity.dotType);
                this.refresh("panel");
            },
        };
    }
}
