import HiddenGraphContext from "editor/contexts/HiddenContext";
import ContinuityDotPanel from "panels/ContinuityDotPanel";

/**
 * The Context that allows a user to define a dot order in
 * a continuity that requires dots to be in order.
 */
export default class ContinuityDotContext extends HiddenGraphContext {
    constructor(controller) {
        super(controller);

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

    get continuity() {
        return this._continuity;
    }

    get panel() {
        return ContinuityDotPanel;
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {OrderedDotsContinuity} continuity - The continuity being edited
     */
    load(options) {
        this._continuity = options.continuity;

        super.load(options);
    }

    unload() {
        super.unload();

        this._getGraphDots().css("opacity", "");

        this.checkContinuities({
            dots: this._continuity.dotType,
        });
    }

    refreshGrapher() {
        super.refreshGrapher();

        this._getGraphDots().css("opacity", 1);
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
