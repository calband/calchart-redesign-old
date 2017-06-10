import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandEven from "calchart/movements/MovementCommandEven";
import { EvenContinuityPopup } from "popups/ContinuityPopups";

/**
 * A continuity where dots use the rest of the time to go straight to
 * their next dot
 */
export default class EvenContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     *   - {string} [orientation=""] - The direction to face while moving (only for
     *     military slides). Can also be the empty string to denote facing the
     *     direction of travel
     */
    constructor(sheet, dotType, options={}) {
        options = _.defaults({}, options, {
            orientation: "",
        });

        super(sheet, dotType, options);
    }

    static deserialize(sheet, dotType, data) {
        return new EvenContinuity(sheet, dotType, data);
    }

    static get popupClass() {
        return EvenContinuityPopup;
    }

    get info() {
        return {
            type: "even",
            name: "Even",
            label: "Even",
        };
    }

    /**** METHODS ****/

    getContinuityText() {
        let label = this.sheet.getNextSheet().getLabel();
        let step = this.getStepType();
        let orientation = this.getOrientation();
        if (_.isUndefined(orientation)) {
            return `EVEN ${step} TO SS ${label}`;
        } else {
            return `${step}F${orientation} TO SS ${label}`;
        }
    }

    getMovements(dot, data) {
        let start = data.position;
        let end = this._getNextPosition(dot);
        if (_.isNull(end)) {
            return [];
        }

        let options = {
            orientation: this.getOrientationDegrees(),
            beatsPerStep: this.getBeatsPerStep(),
        };

        let move = new MovementCommandEven(
            start.x,
            start.y,
            end.x,
            end.y,
            data.remaining,
            options
        );
        return [move];
    }
}
