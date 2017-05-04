import FollowLeaderContinuity from "calchart/continuities/FollowLeaderContinuity";

import { ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import Iterator from "utils/Iterator";
import { moveElem } from "utils/JSUtils";
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
     * @param {int[]} order - The order of dots (as IDs) in the line. order[i] moves
     *   towards order[i+1], and order[len - 1] follows order[0].
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     */
    constructor(sheet, dotType, duration, order, options) {
        super(sheet, dotType, order, [], options);

        this._duration = duration;
    }

    static deserialize(sheet, dotType, data) {
        return new CounterMarchContinuity(sheet, dotType, data.duration, data.order, data);
    }

    serialize() {
        let data = super.serialize();
        data.type = "CM";
        data.duration = this._duration;
        delete data.path;
        return data;
    }

    get name() {
        return "cm";
    }

    panelHTML(controller) {
        let label = HTMLBuilder.span("CM");

        let editLabel = HTMLBuilder.label("Edit:");

        let editDots = HTMLBuilder.icon("ellipsis-h").click(() => {
            controller.loadContext("ftl-dots", {
                continuity: this,
            });
        });
        setupTooltip(editDots, "Dots");

        return this._wrapPanel(label, editLabel, editDots);
    }

    popupHTML() {
        let { duration, stepType, beatsPerStep, customText } = this._getPopupFields();

        return {
            name: "Counter March",
            fields: [duration, stepType, beatsPerStep, customText],
        };
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

    _getPath(index) {
        let show = this._sheet.getShow();
        let path = this._order.map(id => {
            let dot = show.getDot(id);
            return this._sheet.getDotInfo(dot).position;
        });

        // move preceding dots to end of path
        let shifted = path.splice(0, index);
        path = path.concat(shifted);

        return new Iterator(path, {
            cycle: true,
        });
    }

    _getPopupFields() {
        let fields = super._getPopupFields();

        // duration is a select between remaining/custom, which disables/enables an
        // input for a custom duration
        fields.duration = HTMLBuilder.formfield("Number of beats", HTMLBuilder.select({
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
        }).appendTo(fields.duration);
        fields.duration.find("select").change();

        return fields;
    }

    _getMaxDuration(data) {
        let duration = _.defaultTo(this._duration, Infinity);
        return Math.min(data.remaining, duration);
    }
}
