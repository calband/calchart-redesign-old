import ContinuityContext from "calchart/contexts/ContinuityContext";
import Continuity from "calchart/Continuity";

/**
 * The context that lets the user select the continuities to run
 * in a two-step continuity.
 */
export default class TwoStepContext extends ContinuityContext {
    constructor(controller) {
        super(controller);

        // {TwoStepContinuity}
        this._continuity = null;
    }

    static get actions() {
        return ContextActions;
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {TwoStepContinuity} continuity - The two-step continuity being edited
     */
    load(options) {
        super.load(options);

        this._panel.show();

        this._continuity = options.continuity;
    }

    unload() {
        super.unload();

        this._controller.checkContinuities({
            dots: this._continuity.dotType,
        });
    }

    /**
     * Copied from HiddenContext, since TwoStepContext needs to
     * inherit from ContinuityContext.
     */
    loadSheet(sheet) {
        if (sheet !== this._sheet) {
            this.exit();
        } else {
            super.loadSheet(sheet);
        }
    }

    /**
     * Load continuity context if the user is done with this context.
     */
    exit() {
        this._controller.loadContext("continuity", {
            dotType: this._continuity.dotType,
        });
    }

    _getPanel() {
        return $(".panel.two-step");
    }

    _refreshSheet() {
        let continuities = this._panel.find(".continuities").empty();
        this._continuity.continuities.forEach(continuity => {
            let $continuity = this._getPanelContinuity(continuity);
            continuities.append($continuity);
        });

        // select dots in continuity
        let dots = $(`.dot.${this._continuity.dotType}`);
        this._controller.selectDots(dots);

        // update seek bar
        let beat = this._controller.getCurrentBeat();
        let numBeats = this._sheet.getDuration();
        let position = $(".toolbar .seek").width() / numBeats * beat;
        $(".toolbar .seek .marker").css("transform", `translateX(${position}px)`);
    }

    _setupPanel() {
        super._setupPanel();

        this._panel.find("button.submit").click(() => {
            this.exit();
        });
    }
}

class ContextActions {
    /**
     * Add a continuity of the given type to the two-step continuity.
     *
     * @param {string} type - The type of Continuity to create (@see Continuity).
     * @param {TwoStepContinuity} [twoStep=this._continuity]
     */
    static addContinuity(type, twoStep=this._continuity) {
        let continuity = Continuity.create(type, twoStep.sheet, twoStep.dotType);
        twoStep.addContinuity(continuity);
        this._controller.refresh("context");

        return {
            data: [type, twoStep],
            undo: function() {
                twoStep.removeContinuity(continuity);
                this._controller.refresh("context");
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
        this._controller.refresh("context");

        return {
            data: [continuity, twoStep],
            undo: function() {
                twoStep.addContinuity(continuity);
                this._controller.refresh("context");
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
        let success = twoStep.moveContinuity(continuity, delta);
        if (!success) {
            return false;
        }
        this._controller.refresh("context");

        return {
            data: [continuity, delta, twoStep],
            undo: function() {
                twoStep.moveContinuity(continuity, -delta);
                this._controller.refresh("context");
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
        let changed = continuity.savePopup(data);
        twoStep.sheet.updateMovements(twoStep.dotType);

        return {
            data: [continuity, data, twoStep],
            undo: function() {
                continuity.savePopup(changed);
                twoStep.sheet.updateMovements(twoStep.dotType);
            },
        };
    }
}
