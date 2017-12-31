import $ from 'jquery';

import BaseContinuity from 'calchart/continuities/BaseContinuity';
import MovementCommandMove from 'calchart/movements/MovementCommandMove';
// import { ForwardContinuityPopup } from 'popups/ContinuityPopups';

import { DIRECTIONS } from 'utils/CalchartUtils';
// import HTMLBuilder from 'utils/HTMLBuilder';
import { validatePositive, parseNumber } from 'utils/JSUtils';

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
        return new ForwardContinuity(
            sheet, dotType, data.steps, data.direction, data
        );
    }

    serialize() {
        return super.serialize({
            steps: this._numSteps,
            direction: this._direction,
        });
    }

    static get popupClass() {
        return ForwardContinuityPopup;
    }

    get info() {
        return {
            type: 'fm',
            name: 'Forward March',
            label: 'Move',
        };
    }

    /**** METHODS ****/

    getContinuityText() {
        let direction = DIRECTIONS[this._direction];
        return `FM${this.getStepType()} ${this._numSteps} ${direction}`;
    }

    /**
     * @return {int}
     */
    getDirection() {
        return this._direction;
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

    /**
     * @return {int}
     */
    getNumSteps() {
        return this._numSteps;
    }

    getPanel(context) {
        let steps = HTMLBuilder.input({
            type: 'number',
            initial: this._numSteps,
            change: e => {
                this._numSteps = validatePositive(e.currentTarget);
                this._updateMovements(context);
            },
        });

        let direction = HTMLBuilder.select({
            options: DIRECTIONS,
            initial: this._direction,
            change: e => {
                this._direction = parseNumber($(e.currentTarget).val());
                this._updateMovements(context);
            },
        });

        return [steps, direction];
    }
}
