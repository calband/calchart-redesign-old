import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandMove from "calchart/movements/MovementCommandMove";
import MovementCommandStop from "calchart/movements/MovementCommandStop";

import { ENDINGS } from "utils/CalchartUtils";
import HTMLBuilder from "utils/HTMLBuilder";
import { validatePositive, parseNumber } from "utils/JSUtils";
import { calcAngle } from "utils/MathUtils";

/**
 * A grapevine continuity, which moves north or south to get to the next sheet's
 * position and marks time or closes for the rest of the beats.
 */
export default class GrapevineContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     *   - {string} orientation - The direction to face during the movement.
     *   - {string} end - Whether to marktime or close at the end (default MT).
     */
    constructor(sheet, dotType, options) {
        super(sheet, dotType, options);

        options = _.defaults(options, {
            end: "MT",
        });

        this._end = options.end;
    }

    static deserialize(sheet, dotType, data) {
        return new GrapevineContinuity(sheet, dotType, data);
    }

    serialize() {
        return super.serialize("GRAPEVINE", {
            end: this._end,
        });
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

        let deltaX = end.x - data.position.x;
        if (deltaX === 0) {
            return [];
        }

        let move = new MovementCommandMove(
            data.position.x,
            data.position.y,
            deltaX < 0 ? 90 : 270,
            deltaX,
            options
        );

        let stop = new MovementCommandStop(
            data.position.x + deltaX,
            data.position.y,
            options.orientation,
            data.remaining - deltaX,
            this._end === "MT",
            options
        );

        return [move, stop];
    }

    panelHTML(controller) {
        let _this = this;

        let label = HTMLBuilder.span("GV");

        let endLabel = HTMLBuilder.label("End:");
        let endChoices = HTMLBuilder.select({
            options: ENDINGS,
            change: function() {
                _this._end = $(this).val();
                _this._updateMovements(controller);
            },
            initial: this._end,
        });

        return this._wrapPanel(label, endChoices);
    }

    popupHTML() {
        let { end, stepType, orientation, beatsPerStep, customText } = this._getPopupFields();

        return {
            name: "Grapevine",
            fields: [end, stepType, orientation, beatsPerStep, customText],
        };
    }

    _getPopupFields() {
        let fields = super._getPopupFields();

        fields.end = HTMLBuilder.formfield("End", HTMLBuilder.select({
            options: ENDINGS,
            initial: this._end,
        }));

        return fields;
    }
}
