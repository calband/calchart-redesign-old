import * as _ from "lodash";

import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandEven from "calchart/movements/MovementCommandEven";

import HTMLBuilder from "utils/HTMLBuilder";

/**
 * A continuity where dots use the rest of the time to go straight to
 * their next dot
 */
export default class EvenContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {string} dotType
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     *   - {string} orientation - The direction to face while moving (only for
     *     military slides). Can also be the empty string to denote moving in the
     *     same direction
     */
    constructor(sheet, dotType, options) {
        super(sheet, dotType, options);
    }

    static deserialize(sheet, dotType, data) {
        return new EvenContinuity(sheet, dotType, data);
    }

    serialize() {
        return super.serialize("EVEN");
    }

    getMovements(dot, data) {
        let nextSheet = this._sheet.getNextSheet();
        if (_.isNull(nextSheet)) {
            return [];
        }
        let end = nextSheet.getPosition(dot);
        let options = {
            orientation: this.getOrientationDegrees(),
            beatsPerStep: this.getBeatsPerStep(),
        };

        let move = new MovementCommandEven(
            data.position.x,
            data.position.y,
            end.x,
            end.y,
            data.remaining,
            options
        );
        return [move];
    }

    panelHTML(controller) {
        let label = HTMLBuilder.span("Even");
        return this._wrapPanel("even", [label]);
    }

    popupHTML() {
        let { stepType, orientation, beatsPerStep } = this._getPopupFields();

        return {
            name: "Even",
            fields: [stepType, orientation, beatsPerStep],
        };
    }

    _getPopupFields() {
        let fields = super._getPopupFields();

        fields.orientation = HTMLBuilder.formfield("Orientation", HTMLBuilder.select({
            options: {
                "": "Direction of Travel",
                "default": "Default",
                "east": "East",
                "west": "West",
            },
            initial: this._orientation,
        }));

        return fields;
    };
}
