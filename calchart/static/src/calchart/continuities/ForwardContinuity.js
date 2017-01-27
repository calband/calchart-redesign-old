import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandMove from "calchart/movements/MovementCommandMove";

import { DIRECTIONS } from "utils/CalchartUtils";
import HTMLBuilder from "utils/HTMLBuilder";
import { validatePositive, parseNumber } from "utils/JSUtils";

/**
 * A simple forward march continuity, taking the given number
 * of steps in a given direction
 */
export default class ForwardContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {int} steps - The number of steps to move.
     * @param {int} direction - The direction to march, in Calchart degrees.
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     */
    constructor(sheet, dotType, steps, direction, options) {
        super(sheet, dotType, options);

        this._numSteps = steps;
        this._direction = direction;
    }

    static deserialize(sheet, dotType, data) {
        return new ForwardContinuity(sheet, dotType, data.steps, data.direction, data);
    }

    serialize() {
        return super.serialize("FORWARD", {
            steps: this._numSteps,
            direction: this._direction,
        });
    }

    getMovements(dot, data) {
        let options = {
            beatsPerStep: this.getBeatsPerStep(),
        };
        let move = new MovementCommandMove(
            data.position.x,
            data.position.y,
            this._direction,
            this._numSteps * options.beatsPerStep,
            options
        );
        return [move];
    }

    panelHTML(controller) {
        let _this = this;

        let label = HTMLBuilder.span("Move");

        let steps = HTMLBuilder.input({
            class: "panel-continuity-duration",
            type: "number",
            initial: this._numSteps,
            change: function() {
                _this._numSteps = validatePositive(this);
                _this._updateMovements(controller);
            },
        });

        let direction = HTMLBuilder.select({
            options: DIRECTIONS,
            initial: this._direction,
            change: function() {
                _this._direction = parseNumber($(this).val());
                _this._updateMovements(controller);
            },
        });

        return this._wrapPanel("fm", [label, steps, direction]);
    }

    popupHTML() {
        let { steps, direction, stepType, beatsPerStep } = this._getPopupFields();

        return {
            name: "Forward March",
            fields: [steps, direction, stepType, beatsPerStep],
        };
    }

    _getPopupFields() {
        let fields = super._getPopupFields();

        fields.steps = HTMLBuilder.formfield("Number of steps", HTMLBuilder.input({
            type: "number",
            initial: this._numSteps,
        }), "numSteps");

        fields.direction = HTMLBuilder.formfield("Direction", HTMLBuilder.select({
            options: DIRECTIONS,
            initial: this._direction,
        }));

        delete fields.orientation;

        return fields;
    }
}
