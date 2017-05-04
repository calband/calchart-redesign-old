import ForwardContinuity from "calchart/continuities/ForwardContinuity";
import MovementCommandMove from "calchart/movements/MovementCommandMove";

import { DIRECTIONS } from "utils/CalchartUtils";
import HTMLBuilder from "utils/HTMLBuilder";
import { validatePositive, parseNumber } from "utils/JSUtils";

// constrain to only north or south
let GV_DIRECTIONS = _.clone(DIRECTIONS);
delete GV_DIRECTIONS[0];
delete GV_DIRECTIONS[180];

/**
 * The Grapevine continuity, which is basically a forward march, except
 * the orientation is not the same as direction of motion.
 */
export default class GrapevineContinuity extends ForwardContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {int} steps - The number of steps to move.
     * @param {int} direction - The direction to march, in Calchart degrees.
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     *   - {string} orientation - The direction to face during the movement.
     */
    constructor(sheet, dotType, steps, direction, options) {
        super(sheet, dotType, steps, direction, options);
    }

    static deserialize(sheet, dotType, data) {
        return new GrapevineContinuity(sheet, dotType, data.steps, data.direction, data);
    }

    serialize() {
        let data = super.serialize();
        data.type = "GRAPEVINE";
        return data;
    }

    get name() {
        return "gv";
    }

    panelHTML(controller) {
        let _this = this;

        let label = HTMLBuilder.span("Move");

        let steps = HTMLBuilder.input({
            type: "number",
            initial: this._numSteps,
            change: function() {
                _this._numSteps = validatePositive(this);
                _this._updateMovements(controller);
            },
        });

        let direction = HTMLBuilder.select({
            options: GV_DIRECTIONS,
            initial: this._direction,
            change: function() {
                _this._direction = parseNumber($(this).val());
                _this._updateMovements(controller);
            },
        });

        return this._wrapPanel(label, steps, direction);
    }

    popupHTML() {
        let data = super.popupHTML();
        data.name = "Grapevine";
        return data;
    }

    _getPopupFields() {
        let fields = super._getPopupFields();

        fields.steps = HTMLBuilder.formfield("Number of steps", HTMLBuilder.input({
            type: "number",
            initial: this._numSteps,
        }), "numSteps");

        fields.direction = HTMLBuilder.formfield("Direction", HTMLBuilder.select({
            options: GV_DIRECTIONS,
            initial: this._direction,
        }));

        return fields;
    }
}
