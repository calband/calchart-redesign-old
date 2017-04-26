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

    /**
     * Get the movements for a diagonal/high step movement
     *
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {object} options
     *   - {boolean} diagFirst
     *   - {int} beatsPerStep
     * @return {MovementCommand[]}
     */
    static getDiagonalMoves(x1, y1, x2, y2, options) {
        let deltaX = x2 - x1;
        let deltaY = y2 - y1;
        let absX = Math.abs(deltaX);
        let absY = Math.abs(deltaY);

        let diagSteps = Math.min(absX, absY);
        let diagAngle = calcAngle(0, 0, Math.sign(deltaX), Math.sign(deltaY));
        let moveSteps = Math.abs(absX - absY);
        let moveAngle = absX > absY ? this._getXAngle(deltaX) : this._getYAngle(deltaY);

        let movements = [];

        function addMovement(x, y, dir, steps, stepSize) {
            if (steps === 0) {
                return;
            }
            let duration = steps * options.beatsPerStep;
            options.stepSize = stepSize;
            let movement = new MovementCommandMove(x, y, dir, duration, options);
            movements.push(movement);
        }

        if (options.diagFirst) {
            addMovement(x1, y1, diagAngle, diagSteps, STEP_SIZES.DIAGONAL);

            let mid = _.last(movements).getEndPosition();
            addMovement(mid.x, mid.y, moveAngle, moveSteps, STEP_SIZES.STANDARD);
        } else {
            addMovement(x1, y1, moveAngle, moveSteps, STEP_SIZES.STANDARD);

            let mid = _.last(movements).getEndPosition();
            addMovement(mid.x, mid.y, diagAngle, diagSteps, STEP_SIZES.DIAGONAL);
        }

        return movements;
    }

    serialize() {
        let data = super.serialize();
        data.type = "DIAGONAL";
        data.diagFirst = this._diagFirst;
        return data;
    }

    getMovements(dot, data) {
        let start = data.position;
        let nextSheet = this._sheet.getNextSheet();
        if (_.isNull(nextSheet)) {
            return [];
        }
        let end = nextSheet.getPosition(dot);
        let options = {
            beatsPerStep: this.getBeatsPerStep(),
            diagFirst: this._diagFirst,
        };

        let movements = this.constructor.getDiagonalMoves(start.x, start.y, end.x, end.y, options);

        let remaining = this._sheet.getDuration();
        movements.forEach(movement => {
            remaining -= movement.getDuration();
        });
        this._addEnd(movements, remaining, end, options);

        return movements;
    }

    _getType() {
        return this._diagFirst ? "DMHS" : "HSDM";
    }
}
