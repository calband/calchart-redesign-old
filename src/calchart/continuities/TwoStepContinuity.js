import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandMove from "calchart/movements/MovementCommandMove";
import MovementCommandStop from "calchart/movements/MovementCommandStop";

import HTMLBuilder from "utils/HTMLBuilder";
import { setupTooltip } from "utils/UIUtils";

/**
 * A two step continuity, where each dot in a line does a given set of
 * continuities 2 beats after the previous dot.
 */
export default class TwoStepContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {int[]} order - The order of dots (as IDs) in the line. order[0] is
     *   the first dot in the path.
     * @param {Continuity[]} continuities - The continuities each dot should execute
     *   after waiting the appropriate amount of time.
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     */
    constructor(sheet, dotType, order, continuities, options) {
        super(sheet, dotType, options);

        this._order = order;
        this._continuities = continuities;
    }

    static deserialize(sheet, dotType, data) {
        return new TwoStepContinuity(sheet, dotType, data.order, data.continuities, data);
    }

    serialize() {
        return super.serialize("TWO", {
            order: this._order,
            continuities: this._continuities,
        });
    }

    get name() {
        return "two";
    }

    get order() { return this._order; }

    getMovements(dot, data) {
        // TODO
        return [];
    }

    panelHTML(controller) {
        let label = HTMLBuilder.span("2-Step");

        let editLabel = HTMLBuilder.label("Edit:");

        let editDots = HTMLBuilder.icon("ellipsis-h").click(() => {
            controller.loadContext("continuity-dots", {
                continuity: this,
            });
        });
        setupTooltip(editDots, "Dots");

        let editContinuities = HTMLBuilder.icon("map-signs").click(() => {
            // TODO
            controller.loadContext("two-step-continuities", {
                continuity: this,
            });
        });
        setupTooltip(editContinuities, "Continuities");

        return this._wrapPanel(label, editLabel, editDots, editContinuities);
    }

    popupHTML() {
        // TODO
        let { steps, direction, stepType, beatsPerStep, customText } = this._getPopupFields();

        return {
            name: "Two Step",
            fields: [steps, direction, stepType, beatsPerStep, customText],
        };
    }

    _getPopupFields() {
        let fields = super._getPopupFields();

        // TODO

        delete fields.orientation;

        return fields;
    }
}
