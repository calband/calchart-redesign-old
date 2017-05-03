import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandMove from "calchart/movements/MovementCommandMove";
import MovementCommandStop from "calchart/movements/MovementCommandStop";

import { ENDINGS } from "utils/CalchartUtils";
import HTMLBuilder from "utils/HTMLBuilder";

/**
 * An EWNS or NSEW continuity, where dots move as far EW or NS as possible,
 * then move NS or EW to get to their next position.
 */
export default class FountainGridContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {boolean} isEWNS - true if EWNS, otherwise NSEW.
     * @param {Object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     *   - {string} orientation - The direction to face at the end.
     *   - {string} end - Whether to marktime or close at the end (default MT).
     */
    constructor(sheet, dotType, isEWNS, options={}) {
        super(sheet, dotType, options);

        this._isEWNS = isEWNS;

        options = _.defaults(options, {
            end: "MT",
        });

        this._end = options.end;
    }

    static deserialize(sheet, dotType, data) {
        return new FountainGridContinuity(sheet, dotType, data.ewns, data);
    }

    serialize() {
        return super.serialize("FOUNTAIN", {
            ewns: this._isEWNS,
            end: this._end,
        });
    }

    static _getXAngle(deltaX) {
        return deltaX < 0 ? 90 : 270;
    }

    static _getYAngle(deltaY) {
        return deltaY < 0 ? 180 : 0;
    }

    getMovements(dot, data) {
        let start = data.position;
        let nextSheet = this._sheet.getNextSheet();
        if (_.isNull(nextSheet)) {
            return [];
        }
        let end = nextSheet.getPosition(dot);

        let deltaX = end.x - start.x;
        let deltaY = end.y - start.y;
        let dirX = this.constructor._getXAngle(deltaX);
        let dirY = this.constructor._getYAngle(deltaY);

        let movements = [];
        let options = {
            beatsPerStep: this.getBeatsPerStep(),
        };

        function addMovement(x, y, dir, steps) {
            let duration = Math.abs(steps) * options.beatsPerStep;
            let movement = new MovementCommandMove(x, y, dir, duration, options);
            movements.push(movement);
        }

        if (this._isEWNS) {
            if (deltaY !== 0) {
                addMovement(start.x, start.y, dirY, deltaY);
            }
            if (deltaX !== 0) {
                addMovement(start.x, end.y, dirX, deltaX);
            }
        } else {
            if (deltaX !== 0) {
                addMovement(start.x, start.y, dirX, deltaX);
            }
            if (deltaY !== 0) {
                addMovement(end.x, start.y, dirY, deltaY);
            }
        }

        let remaining = data.remaining - Math.abs(deltaX) - Math.abs(deltaY);
        this._addEnd(movements, remaining, end, options);

        return movements;
    }

    panelHTML(controller) {
        let _this = this;
        let type = this._getType();

        let label = HTMLBuilder.span(type);

        let endLabel = HTMLBuilder.label("End:");
        let endChoices = HTMLBuilder.select({
            options: ENDINGS,
            change: function() {
                _this._end = $(this).val();
                _this._updateMovements(controller);
            },
            initial: this._end,
        });

        return this._wrapPanel(type, [label, endLabel, endChoices]);
    }

    popupHTML() {
        let { end, stepType, orientation, beatsPerStep, customText } = this._getPopupFields();

        return {
            name: this._getType(),
            fields: [end, stepType, orientation, beatsPerStep, customText],
        };
    }

    _addEnd(movements, remaining, end, options) {
        if (remaining > 0) {
            let orientation = this.getOrientationDegrees();
            let marktime = this._end === "MT";
            let stop = new MovementCommandStop(end.x, end.y, orientation, remaining, marktime, options);
            movements.push(stop);
        }
    }

    _getPopupFields() {
        let fields = super._getPopupFields();

        fields.end = HTMLBuilder.formfield("End", HTMLBuilder.select({
            options: ENDINGS,
            initial: this._end,
        }));

        fields.orientation.find("label").text("Final orientation:");

        return fields;
    }

    _getType() {
        return this._isEWNS ? "EWNS" : "NSEW";
    }
}
