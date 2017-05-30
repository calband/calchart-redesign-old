import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandStop from "calchart/movements/MovementCommandStop";
import { ToEndContinuityPopup } from "popups/ContinuityPopups";

import { ENDINGS } from "utils/CalchartUtils";
import HTMLBuilder from "utils/HTMLBuilder";

/**
 * A superclass for all continuities that end with a StopContinuity
 * to the end.
 */
export default class ToEndContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {Object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     *   - {string} orientation - The direction to face at the end.
     *   - {string} end - Whether to marktime or close at the end (default MT).
     */
    constructor(sheet, dotType, options={}) {
        super(sheet, dotType, options);

        options = _.defaults({}, options, {
            end: "MT",
        });

        this._end = options.end;
    }

    serialize(data={}) {
        data.end = this._end;
        return super.serialize(data);
    }

    static get popupClass() {
        return ToEndContinuityPopup;
    }

    /**** METHODS ****/

    /**
     * @return {string}
     */
    getEnd() {
        return this._end;
    }

    getPanel(context) {
        let endLabel = HTMLBuilder.label("End:");
        let endChoices = HTMLBuilder.select({
            options: ENDINGS,
            change: e => {
                this._end = $(e.currentTarget).val();
                this._updateMovements(context);
            },
            initial: this._end,
        });

        return [endLabel, endChoices];
    }

    /**** HELPERS ****/

    /**
     * Add the marktime or close movement to the list of movements at the end
     * of the continuity.
     *
     * @param {MovementCommand[]} movements
     * @param {int} remaining
     * @param {Coordinate} end
     * @param {object} options
     */
    _addEnd(movements, remaining, end, options) {
        if (remaining > 0) {
            let orientation = this.getOrientationDegrees();
            let marktime = this._end === "MT";
            let stop = new MovementCommandStop(end.x, end.y, orientation, remaining, marktime, options);
            movements.push(stop);
        }
    }
}
