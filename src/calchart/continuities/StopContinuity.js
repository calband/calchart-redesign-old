import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandStop from "calchart/movements/MovementCommandStop";
import { StopContinuityPopup } from "popups/ContinuityPopups";

import HTMLBuilder from "utils/HTMLBuilder";
import { validatePositive } from "utils/JSUtils";

/**
 * A continuity that does not move
 */
export default class StopContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {boolean} isMarkTime - true if mark time, false if close.
     * @param {?int} duration - The number of beats to mark time or close. If null,
     *   use remaining beats.
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType - Only used for mark time.
     *   - {int} beatsPerStep - Only used for mark time.
     *   - {string} orientation - The direction to face at the end.
     */
    constructor(sheet, dotType, isMarkTime, duration, options) {
        super(sheet, dotType, options);

        this._marktime = isMarkTime;
        this._duration = duration;
    }

    static deserialize(sheet, dotType, data) {
        return new StopContinuity(sheet, dotType, data.isMarkTime, data.duration, data);
    }

    serialize() {
        return super.serialize({
            isMarkTime: this._marktime,
            duration: this._duration,
        });
    }

    static get popupClass() {
        return StopContinuityPopup;
    }

    get info() {
        if (this._marktime) {
            return {
                type: "mt",
                name: "Mark Time",
                label: "MT",
            };
        } else {
            return {
                type: "close",
                name: "Close",
                label: "Close",
            };
        }
    }

    /**
     * @return {?int}
     */
    getDuration() {
        return this._duration;
    }

    getMovements(dot, data) {
        let duration = this._duration;
        if (_.isNull(duration)) {
            duration = data.remaining;
        }

        let options = {
            beatsPerStep: this.getBeatsPerStep(),
        };

        let move = new MovementCommandStop(
            data.position.x,
            data.position.y,
            this.getOrientationDegrees(),
            duration,
            this._marktime,
            options
        );

        return [move];
    }

    getPanel(context) {
        let numBeats = HTMLBuilder.input({
            type: "number",
            initial: this._duration,
            change: e => {
                this._duration = validatePositive(e.currentTarget);
                this._updateMovements(context);
            },
        });

        let duration = HTMLBuilder.select({
            options: {
                remaining: "To End",
                custom: "Custom",
            },
            initial: _.isNull(this._duration) ? "remaining" : "custom",
            change: e => {
                switch ($(e.currentTarget).val()) {
                    case "custom":
                        numBeats.prop("disabled", false).change();
                        break;
                    case "remaining":
                        numBeats.prop("disabled", true);
                        this._duration = null;
                        this._updateMovements(context);
                }
            },
        });

        numBeats.prop("disabled", _.isNull(this._duration));

        return [duration, numBeats];
    }
}
