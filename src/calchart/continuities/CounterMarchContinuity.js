import FollowLeaderContinuity from "calchart/continuities/FollowLeaderContinuity";
import { CounterMarchContinuityPopup } from "popups/ContinuityPopups";

import Iterator from "utils/Iterator";

/**
 * A counter-march continuity, which is basically a follow-the-leader continuity
 * except the path follows the line of dots.
 */
export default class CounterMarchContinuity extends FollowLeaderContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {?int} duration - The number of beats to mark time or close. If null,
     *   use remaining beats.
     * @param {Dot[]} order - The order of dots in the line. order[i] moves towards
     *   order[i+1], and order[len - 1] follows order[0].
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     */
    constructor(sheet, dotType, duration, order, options) {
        super(sheet, dotType, order, [], options);

        this._duration = duration;
    }

    static deserialize(sheet, dotType, data) {
        let order = data.order.map(dotId => sheet.show.getDot(dotId));
        return new CounterMarchContinuity(sheet, dotType, data.duration, order, data);
    }

    serialize() {
        let data = super.serialize();
        data.duration = this._duration;
        delete data.path;
        return data;
    }

    static get popupClass() {
        return CounterMarchContinuityPopup;
    }

    get info() {
        return {
            type: "cm",
            name: "Counter March",
            label: "CM",
        };
    }

    /**** METHODS ****/

    /**
     * @return {?int}
     */
    getDuration() {
        return this._duration;
    }

    /**** HELPERS ****/

    _getPathIterator(index) {
        let path = this._order.map(dot => this.sheet.getDotInfo(dot).position);

        // move preceding dots to end of path
        let shifted = path.splice(0, index);
        path = path.concat(shifted);

        return new Iterator(path, {
            cycle: true,
        });
    }

    _getMaxDuration(data) {
        let duration = _.defaultTo(this._duration, Infinity);
        return Math.min(data.remaining, duration);
    }
}
