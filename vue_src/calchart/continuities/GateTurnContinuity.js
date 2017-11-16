import BaseContinuity from "calchart/continuities/BaseContinuity";
import Coordinate from "calchart/Coordinate";
import MovementCommandArc from "calchart/movements/MovementCommandArc";
import { GateTurnContinuityPopup } from "popups/ContinuityPopups";

import HTMLBuilder from "utils/HTMLBuilder";
import { validatePositive } from "utils/JSUtils";
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
     * @param {Coordinate} reference - The point to rotate around.
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     */
    constructor(sheet, dotType, degrees, reference, options) {
        super(sheet, dotType, options);

        this._degrees = degrees;
        this._reference = reference;
    }

    static deserialize(sheet, dotType, data) {
        let reference = Coordinate.deserialize(data.reference);
        return new GateTurnContinuity(sheet, dotType, data.degrees, reference, data);
    }

    serialize() {
        return super.serialize({
            degrees: this._degrees,
            reference: this._reference.serialize(),
        });
    }

    static get popupClass() {
        return GateTurnContinuityPopup;
    }

    get info() {
        return {
            type: "gate",
            name: "Gate Turn",
            label: "Gate",
        };
    }

    /**** METHODS ****/

    getContinuityText() {
        let degrees = Math.abs(this._degrees);
        let orientation = this._degrees < 0 ? "CCW" : "CW";
        return `Gate Turn ${degrees} degrees ${orientation}`;
    }

    /**
     * @return {int}
     */
    getDegrees() {
        return this._degrees;
    }

    getMovements(dot, data) {
        let options = {
            beatsPerStep: this.getBeatsPerStep(),
        };

        let movement = new MovementCommandArc(
            data.position.x,
            data.position.y,
            this._reference,
            this._degrees,
            data.remaining,
            options
        );

        return [movement];
    }

    getPanel(context) {
        let degrees = HTMLBuilder.input({
            type: "number",
            initial: Math.abs(this._degrees),
            change: e => {
                let degrees = validatePositive(e.currentTarget);
                this._degrees = Math.sign(this._degrees) * degrees;
                this._updateMovements(context);
            },
        });

        let direction = HTMLBuilder.select({
            options: {
                CW: "CW",
                CCW: "CCW",
            },
            initial: this._degrees > 0 ? "CW" : "CCW",
            change: e => {
                let sign = $(e.currentTarget).val() === "CW" ? 1 : -1;
                this._degrees = sign * Math.abs(this._degrees);
                this._updateMovements(context);
            },
        });

        let editReference = HTMLBuilder.icon("crosshairs").click(() => {
            context.controller.loadContext("gate-reference", {
                continuity: this,
            });
        });
        setupTooltip(editReference, "Reference Point");

        return [degrees, direction, editReference];
    }

    /**
     * @return {Coordinate}
     */
    getReference() {
        return this._reference;
    }

    /**
     * Set the reference point
     *
     * @param {Coordinate} reference
     */
    setReference(reference) {
        this._reference = reference;
    }
}
