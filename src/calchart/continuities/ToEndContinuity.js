import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandStop from "calchart/movements/MovementCommandStop";

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

    /**** METHODS ****/

    getPanel(controller) {
        let endLabel = HTMLBuilder.label("End:");
        let endChoices = HTMLBuilder.select({
            options: ENDINGS,
            change: e => {
                this._end = $(e.currentTarget).val();
                this._updateMovements(controller);
            },
            initial: this._end,
        });

        return [endLabel, endChoices];
    }

    getPopup() {
        let fields = super.getPopup();

        let end = HTMLBuilder.formfield("End", HTMLBuilder.select({
            options: ENDINGS,
            initial: this._end,
        }));

        return [end].concat(fields);
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
