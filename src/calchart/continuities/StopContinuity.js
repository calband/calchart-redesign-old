import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandStop from "calchart/movements/MovementCommandStop";

import { ORIENTATIONS } from "utils/CalchartUtils";
import { ValidationError } from "utils/errors";
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

    getPanel(controller) {
        let numBeats = HTMLBuilder.input({
            type: "number",
            initial: this._duration,
            change: e => {
                this._duration = validatePositive(e.currentTarget);
                this._updateMovements(controller);
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
                        this._updateMovements(controller);
                }
            },
        });

        numBeats.prop("disabled", _.isNull(this._duration));

        return [duration, numBeats];
    }

    getPopup() {
        let [stepType, orientation, beatsPerStep, customText] = super.getPopup();

        let numBeats = HTMLBuilder.formfield("Number of beats", HTMLBuilder.input({
            type: "number",
            initial: this._duration,
        }), "numBeats");

        let duration = HTMLBuilder.formfield("Duration", HTMLBuilder.select({
            options: {
                remaining: "To End",
                custom: "Custom",
            },
            initial: _.isNull(this._duration) ? "remaining" : "custom",
            change: function() {
                numBeats.find("input").prop("disabled", $(this).val() !== "custom");
            },
        }));
        duration.find("select").change();

        switch (this.info.type) {
            case "close":
                return [duration, numBeats, orientation, customText];
            case "mt":
                return [duration, numBeats, orientation, stepType, beatsPerStep, customText];
        }
    }

    validatePopup(data) {
        super.validatePopup(data);

        if (data.duration === "remaining") {
            data.duration = null;
        } else {
            data.duration = parseInt(data.numBeats);
            if (_.isNaN(data.duration)) {
                throw new ValidationError("Please provide the number of beats.");
            } else if (data.duration <= 0) {
                throw new ValidationError("Duration needs to be a positive integer.");
            }
        }
    }
}
