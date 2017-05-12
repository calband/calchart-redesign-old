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
        return super.serialize({
            steps: this._numSteps,
            direction: this._direction,
        });
    }

    get info() {
        return {
            type: "fm",
            name: "Forward March",
        };
    }

    getMovements(dot, data) {
        let options = {
            beatsPerStep: this.getBeatsPerStep(),
            orientation: this._orientation,
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

    getPanel(controller) {
        let _this = this;

        let label = HTMLBuilder.span("Move");

        let steps = HTMLBuilder.input({
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

        return [label, steps, direction];
    }

    getPopup() {
        let [stepType, orientation, beatsPerStep, customText] = super.getPopup();

        let steps = HTMLBuilder.formfield("Number of steps", HTMLBuilder.input({
            type: "number",
            initial: this._numSteps,
        }), "numSteps");

        let direction = HTMLBuilder.formfield("Direction", HTMLBuilder.select({
            options: DIRECTIONS,
            initial: this._direction,
        }));

        return [steps, direction, stepType, beatsPerStep, customText];
    }
}
