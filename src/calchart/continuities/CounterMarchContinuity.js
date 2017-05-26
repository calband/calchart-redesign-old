import FollowLeaderContinuity from "calchart/continuities/FollowLeaderContinuity";

import { ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import Iterator from "utils/Iterator";
import { setupTooltip } from "utils/UIUtils";

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

    get info() {
        return {
            type: "cm",
            name: "Counter March",
            label: "CM",
        };
    }

    getPanel(controller) {
        let editLabel = HTMLBuilder.label("Edit:");

        let editDots = HTMLBuilder.icon("ellipsis-h").click(() => {
            controller.loadContext("continuity-dots", {
                continuity: this,
            });
        });
        setupTooltip(editDots, "Dots");

        return [editLabel, editDots];
    }

    getPopup() {
        let [stepType, orientation, beatsPerStep, customText] = super.getPopup();

        // duration is a select between remaining/custom, which disables/enables an
        // input for a custom duration
        let duration = HTMLBuilder.formfield("Number of beats", HTMLBuilder.select({
            options: {
                remaining: "Remaining",
                custom: "Custom",
            },
            change: function() {
                let disabled = $(this).val() !== "custom";
                $(this).siblings("input").prop("disabled", disabled);
            },
            initial: this._duration === null ? "remaining" : "custom",
        }), "duration");
        HTMLBuilder.input({
            name: "customDuration",
            type: "number",
            initial: _.defaultTo(this._duration, 0),
        }).appendTo(duration);
        duration.find("select").change();

        return [duration, stepType, beatsPerStep, customText];
    }

    validatePopup(data) {
        super.validatePopup(data);

        if (data.duration === "custom") {
            data.duration = parseInt(data.customDuration);
            if (_.isNaN(data.duration)) {
                throw new ValidationError("Please provide the duration.");
            } else if (data.duration <= 0) {
                throw new ValidationError("Duration needs to be a positive integer.");
            }
        } else {
            data.duration = null;
        }
    }

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
