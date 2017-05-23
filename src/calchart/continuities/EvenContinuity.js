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
     * @param {DotType} dotType
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     *   - {string} [orientation=""] - The direction to face while moving (only for
     *     military slides). Can also be the empty string to denote facing the
     *     direction of travel
     */
    constructor(sheet, dotType, options={}) {
        options = _.defaults({}, options, {
            orientation: "",
        });

        super(sheet, dotType, options);
    }

    static deserialize(sheet, dotType, data) {
        return new EvenContinuity(sheet, dotType, data);
    }

    get info() {
        return {
            type: "even",
            name: "Even",
        };
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

    getPanel(controller) {
        let label = HTMLBuilder.span("Even");
        return [label];
    }

    getPopup() {
        let [stepType, orientation, beatsPerStep, customText] = super.getPopup();

        let select = HTMLBuilder.select({
            options: {
                "": "Direction of Travel",
                "default": "Default",
                "east": "East",
                "west": "West",
            },
            initial: this._orientation,
        });
        orientation.find("select").remove();
        orientation.append(select);

        return [stepType, orientation, beatsPerStep, customText];
    }
}
