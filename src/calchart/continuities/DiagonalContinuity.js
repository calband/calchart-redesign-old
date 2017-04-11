import * as _ from "lodash";

import FountainGridContinuity from "calchart/continuities/FountainGridContinuity";
import MovementCommandMove from "calchart/movements/MovementCommandMove";
import MovementCommandStop from "calchart/movements/MovementCommandStop";

import { STEP_SIZES } from "utils/CalchartUtils";
import { calcAngle } from "utils/MathUtils";

/**
 * An DMHS or HSDM continuity, where dots move as far diagonally as possible,
 * then move EW or NS to get to their next position (or vice versa).
 */
export default class DiagonalContinuity extends FountainGridContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {boolean} diagFirst - True if DMHS, false otherwise
     * @param {Object} [options]
     */
    constructor(sheet, dotType, diagFirst, options={}) {
        super(sheet, dotType, null, options);

        delete this._isEWNS;
        this._diagFirst = diagFirst;
    }

    static deserialize(sheet, dotType, data) {
        return new DiagonalContinuity(sheet, dotType, data.diagFirst, data);
    }

    serialize() {
        let data = super.serialize();
        data.type = "DIAGONAL";
        data.diagFirst = this._diagFirst;
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
        let absX = Math.abs(deltaX);
        let absY = Math.abs(deltaY);

        let diagSteps = Math.min(absX, absY);
        let diagAngle = calcAngle(0, 0, Math.sign(deltaX), Math.sign(deltaY));
        let moveSteps = Math.abs(absX - absY);
        let moveAngle = absX > absY ? this._getXAngle(deltaX) : this._getYAngle(deltaY);

        let movements = [];
        let options = {
            beatsPerStep: this.getBeatsPerStep(),
        };

        function addMovement(x, y, dir, steps, stepSize) {
            if (steps === 0) {
                return;
            }
            let duration = steps * options.beatsPerStep;
            options.stepSize = stepSize;
            let movement = new MovementCommandMove(x, y, dir, duration, options);
            movements.push(movement);
        }

        if (this._diagFirst) {
            addMovement(start.x, start.y, diagAngle, diagSteps, STEP_SIZES.DIAGONAL);

            let mid = _.last(movements).getEndPosition();
            addMovement(mid.x, mid.y, moveAngle, moveSteps, STEP_SIZES.STANDARD);
        } else {
            addMovement(start.x, start.y, moveAngle, moveSteps, STEP_SIZES.STANDARD);

            let mid = _.last(movements).getEndPosition();
            addMovement(mid.x, mid.y, diagAngle, diagSteps, STEP_SIZES.DIAGONAL);
        }

        let remaining = this._sheet.getDuration() - diagSteps - moveSteps;
        this._addEnd(movements, remaining, end, options);

        return movements;
    }

    _getType() {
        return this._diagFirst ? "DMHS" : "HSDM";
    }
}
