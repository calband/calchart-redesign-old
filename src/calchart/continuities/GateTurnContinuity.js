import BaseContinuity from "calchart/continuities/BaseContinuity";
import Coordinate from "calchart/Coordinate";
import MovementCommandArc from "calchart/movements/MovementCommandArc";

import HTMLBuilder from "utils/HTMLBuilder";
import { parseNumber, validatePositive } from "utils/JSUtils";
import { setupTooltip } from "utils/UIUtils";

/**
 * A continuity where the dots rotate around a reference point for the
 * remaining amount of time.
 */
export default class GateTurnContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {int} degrees - The number of degrees to rotate around. Positive
     *   goes clockwise, negative goes counterclockwise.
     * @param {int} isCW - true if turning clockwise; false for counterclockwise.
     * @param {Coordinate} reference - The point to rotate around.
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     */
    constructor(sheet, dotType, degrees, isCW, reference, options) {
        super(sheet, dotType, options);

        this._degrees = degrees;
        this._isCW = isCW;
        this._reference = reference;
    }

    static deserialize(sheet, dotType, data) {
        let reference = Coordinate.deserialize(data.reference);
        return new GateTurnContinuity(sheet, dotType, data.degrees, data.isCW, reference, data);
    }

    serialize() {
        return super.serialize("GATE", {
            degrees: this._degrees,
            isCW: this._isCW,
            reference: this._reference.serialize(),
        });
    }

    get name() {
        return "gate";
    }

    get reference() { return this._reference; }

    getMovements(dot, data) {
        let sign = this._isCW ? 1 : -1;
        let movement = new MovementCommandArc(
            data.position.x,
            data.position.y,
            this._reference,
            sign * this._degrees,
            data.remaining,
        );

        return [movement];
    }

    panelHTML(controller) {
        let _this = this;

        let label = HTMLBuilder.span("GATE");

        let degrees = HTMLBuilder.input({
            type: "number",
            initial: this._degrees,
            change: function() {
                _this._numSteps = validatePositive(this);
                _this._updateMovements(controller);
            },
        });

        let direction = HTMLBuilder.select({
            options: {
                CW: "CW",
                CCW: "CCW",
            },
            initial: this._isCW ? "CW" : "CCW",
            change: function() {
                _this._isCW = $(this).val() === "CW";
                _this._updateMovements(controller);
            },
        });

        let editReference = HTMLBuilder.icon("crosshairs").click(() => {
            // TODO
            controller.loadContext("gate-reference", {
                continuity: this,
            });
        });
        setupTooltip(editReference, "Reference Point");

        return this._wrapPanel(label, degrees, direction, editReference);
    }

    popupHTML() {
        let {
            degrees,
            direction,
            stepType,
            beatsPerStep,
            customText,
        } = this._getPopupFields();

        return {
            name: "Gate Turn",
            fields: [degrees, direction, stepType, beatsPerStep, customText],
        };
    }

    /**
     * Set the reference point
     *
     * @param {Coordinate} reference
     */
    setReference(reference) {
        this._reference = reference;
    }

    validatePopup(data) {
        super.validatePopup(data);

        data.isCW = data.isCW === "CW";
    }

    _getPopupFields() {
        let fields = super._getPopupFields();

        fields.degrees = HTMLBuilder.formfield("Degrees to turn", HTMLBuilder.input({
            type: "number",
            initial: this._degrees,
        }), "degrees");

        fields.direction = HTMLBuilder.formfield("Direction", HTMLBuilder.select({
            options: {
                CW: "Clockwise",
                CCW: "Counter-clockwise",
            },
            initial: this._isCW ? "CW" : "CCW",
        }), "isCW");

        delete fields.orientation;

        return fields;
    }
}
