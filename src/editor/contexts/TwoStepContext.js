import Continuity from "calchart/Continuity";
import ContinuityContext from "editor/contexts/ContinuityContext";
import { HiddenContextMixin } from "editor/contexts/HiddenContext";
import TwoStepPanel from "panels/TwoStepPanel";

import { underscoreKeys, update } from "utils/JSUtils";

/**
 * The context that lets the user select the continuities to run
 * in a two-step continuity.
 */
export default class TwoStepContext extends HiddenContextMixin(ContinuityContext) {
    constructor(controller) {
        super(controller);

        // {TwoStepContinuity}
        this._continuity = null;
    }

    static get actions() {
        return ContextActions;
    }

    static get info() {
        return {
            name: "two-step",
            html: super.info.html,
        };
    }

    get continuity() {
        return this._continuity;
    }

    get panel() {
        return TwoStepPanel;
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {TwoStepContinuity} continuity - The two-step continuity being edited
     */
    load(options) {
        super.load(options);

        this._continuity = options.continuity;
    }

    unload() {
        super.unload();

        this.checkContinuities({
            dots: this._continuity.dotType,
        });
    }

    /**
     * Load continuity context if the user is done with this context.
     */
    exit() {
        this.controller.loadContext("continuity", {
            dotType: this._continuity.dotType,
        });
    }
}

class ContextActions extends ContinuityContext.actions {
    /**
     * Add a continuity of the given type to the two-step continuity.
     *
     * @param {string} type - The type of Continuity to create (@see Continuity).
     * @param {TwoStepContinuity} [twoStep=this._continuity]
     */
    static addContinuity(type, twoStep=this._continuity) {
        let continuity = Continuity.create(type, twoStep.sheet, twoStep.dotType);
        twoStep.addContinuity(continuity);
        this.refresh("grapher", "panel");

        return {
            data: [type, twoStep],
            undo: function() {
                twoStep.removeContinuity(continuity);
                this.refresh("grapher", "panel");
            },
        };
    }

    /**
     * Remove the given continuity from the two-step continuity.
     *
     * @param {Continuity} continuity - The Continuity to remove
     * @param {TwoStepContinuity} [twoStep=this._continuity]
     */
    static removeContinuity(continuity, twoStep=this._continuity) {
        twoStep.removeContinuity(continuity);
        this.refresh("grapher", "panel");

        return {
            data: [continuity, twoStep],
            undo: function() {
                twoStep.addContinuity(continuity);
                this.refresh("grapher", "panel");
            },
        };
    }

    /**
     * Reorder the given continuity by the given amount.
     *
     * @param {Continuity} continuity - The continuity to reorder.
     * @param {int} delta - The amount to move the continuity by; e.g. delta=1
     *   would put the continuity 1 index later, if possible.
     * @param {TwoStepContinuity} [twoStep=this._continuity]
     */
    static reorderContinuity(continuity, delta, twoStep=this._continuity) {
        let continuities = twoStep.getContinuities();
        let from = continuities.indexOf(continuity);
        let to = from + delta;

        if (to < 0 || to >= continuities.length) {
            return false;
        }

        twoStep.moveContinuity(from, to);
        this.refresh("grapher", "panel");

        return {
            data: [continuity, delta, twoStep],
            undo: function() {
                twoStep.moveContinuity(to, from);
                this.refresh("grapher", "panel");
            },
        };
    }

    /**
     * Save the given continuity in the two-step continuity.
     *
     * @param {Continuity} continuity - The Continuity to save.
     * @param {object} data - The data to save.
     * @param {TwoStepContinuity} [twoStep=this._continuity]
     */
    static saveContinuity(continuity, data, twoStep=this._continuity) {
        let changed = update(continuity, underscoreKeys(data));
        twoStep.sheet.updateMovements(twoStep.dotType);

        return {
            data: [continuity, data, twoStep],
            undo: function() {
                update(continuity, changed);
                twoStep.sheet.updateMovements(twoStep.dotType);
            },
        };
    }
}
