import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandMove from "calchart/movements/MovementCommandMove";

import { ORIENTATIONS } from "utils/CalchartUtils";
import HTMLBuilder from "utils/HTMLBuilder";
import { validatePositive, parseNumber } from "utils/JSUtils";
import { calcAngle } from "utils/MathUtils";

/**
 * TODO
 */
export default class GrapevineContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     *   - {string} orientation - The direction to face during the movement.
     */
    constructor(sheet, dotType, options) {
        super(sheet, dotType, options);
    }

    static deserialize(sheet, dotType, data) {
        return new GrapevineContinuity(sheet, dotType, data);
    }

    serialize() {
        return super.serialize("GRAPEVINE");
    }

    get name() {
        return "gv";
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

        let direction = calcAngle(data.position.x, data.position.y, end.x, end.y);
        if (_.isNaN(direction)) {
            direction = 0;
        }

        // TODO: error if not north or south
        // TODO: duration = deltaX
        // TODO: end mt or close

        let move = new MovementCommandMove(
            data.position.x,
            data.position.y,
            direction,
            data.remaining,
            options
        );
        return [move];
    }

    panelHTML(controller) {
        let _this = this;

        let label = HTMLBuilder.span("GV");

        let orientation = HTMLBuilder.select({
            options: ORIENTATIONS,
            initial: this._orientation,
            change: function() {
                _this._orientation = $(this).val();
                _this._updateMovements(controller);
            },
        });

        return this._wrapPanel(label, orientation);
    }

    popupHTML() {
        let { stepType, orientation, beatsPerStep, customText } = this._getPopupFields();

        return {
            name: "Grapevine",
            fields: [stepType, orientation, beatsPerStep, customText],
        };
    }
}
