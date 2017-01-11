import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandStop from "calchart/movements/MovementCommandStop";

import { ORIENTATIONS } from "utils/CalchartUtils";
import HTMLBuilder from "utils/HTMLBuilder";
import { validatePositive } from "utils/JSUtils";

/**
 * A continuity that does not move
 */
export default class StopContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {string} dotType
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
        return super.serialize("STOP", {
            isMarkTime: this._marktime,
            duration: this._duration,
        });
    }

    getMovements(dot, data) {
        let duration = data.remaining;
        if (this._marktime && this._duration !== null) {
            duration = this._duration;
        }

        let options = {
            beatsPerStep: this.getBeatsPerStep(),
        };

        let move = new MovementCommandStop(
            data.position.x,
            data.position.y,
            this.getOrientation(),
            duration,
            this._marktime,
            options
        );

        return [move];
    }

    panelHTML(controller) {
        let _this = this;

        if (!this._marktime) {
            // close
            let label = HTMLBuilder.span("Close");
            return this._wrapPanel("close", [label]);
        } else if (this._duration === null) {
            // mark time remaining
            let label = HTMLBuilder.span("MTRM");

            let orientation = HTMLBuilder.select({
                options: ORIENTATIONS,
                change: function() {
                    _this._orientation = $(this).val();
                    _this._updateMovements(controller);
                },
                initial: this._orientation,
            });

            return this._wrapPanel("mtrm", [label, orientation]);
        } else {
            // mark time for a duration
            let label = HTMLBuilder.span("MT");

            let durationLabel = HTMLBuilder.span("Beats:");
            let duration = HTMLBuilder.input({
                class: "panel-continuity-duration",
                type: "number",
                initial: this._duration,
                change: function() {
                    _this._duration = JSUtils.validatePositive(this);
                    _this._updateMovements(controller);
                },
            });

            return this._wrapPanel("mt", [label, durationLabel, duration]);
        }
    }

    popupHTML() {
        let { orientation, stepType, beatsPerStep, duration } = this._getPopupFields();

        if (!this._marktime) {
            return {
                name: "Close",
                fields: [orientation],
            };
        } else if (this._duration === null) {
            return {
                name: "Mark Time Remaining",
                fields: [orientation, stepType, beatsPerStep],
            };
        } else {
            return {
                name: "Mark Time",
                fields: [duration, orientation, stepType, beatsPerStep],
            };
        }
    }

    _getPopupFields() {
        let fields = super._getPopupFields();

        fields.duration = HTMLBuilder.formfield("Number of beats", HTMLBuilder.input({
            type: "number",
            initial: this._duration,
        }), "duration");

        return fields;
    }
}
