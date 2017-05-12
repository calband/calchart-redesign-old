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

    get info() {
        if (!this._marktime) {
            return {
                type: "close",
                name: "Close",
            };
        } else if (_.isNull(this._duration)) {
            return {
                type: "mtrm",
                name: "Mark Time Remaining",
            };
        } else {
            return {
                type: "mt",
                name: "Mark Time",
            };
        }
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
            this.getOrientationDegrees(),
            duration,
            this._marktime,
            options
        );

        return [move];
    }

    getPanel(controller) {
        let _this = this;
        let label = HTMLBuilder.span();

        switch (this.name) {
            case "close":
                label.text("Close");
                return [label];
            case "mtrm":
                label.text("MTRM");

                let orientationLabel = HTMLBuilder.label("Facing:");
                let orientation = HTMLBuilder.select({
                    options: ORIENTATIONS,
                    change: function() {
                        _this._orientation = $(this).val();
                        _this._updateMovements(controller);
                    },
                    initial: this._orientation,
                });

                return [label, orientationLabel, orientation];
            case "mt":
                label.text("MT");

                let durationLabel = HTMLBuilder.label("Beats:");
                let duration = HTMLBuilder.input({
                    type: "number",
                    initial: this._duration,
                    change: function() {
                        _this._duration = validatePositive(this);
                        _this._updateMovements(controller);
                    },
                });

                return [label, durationLabel, duration];
        }
    }

    getPopup() {
        let [stepType, orientation, beatsPerStep, customText] = super.getPopup();

        switch (this.name) {
            case "close":
                return [orientation, customText];
            case "mtrm":
                return [orientation, stepType, beatsPerStep, customText];
            case "mt":
                let duration = HTMLBuilder.formfield("Number of beats", HTMLBuilder.input({
                    type: "number",
                    initial: this._duration,
                }), "duration");
                return [duration, orientation, stepType, beatsPerStep, customText];
        }
    }
}
