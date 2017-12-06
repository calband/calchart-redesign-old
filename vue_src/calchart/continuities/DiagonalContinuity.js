import { isNull } from 'lodash';

import FountainGridContinuity from "calchart/continuities/FountainGridContinuity";
import MovementCommandMove from "calchart/movements/MovementCommandMove";

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
        data.diagFirst = this._diagFirst;
        return data;
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
     * @return {MovementCommandMove[]}
     */
    static getDiagonalMoves(x1, y1, x2, y2, options) {
        let deltaX = x2 - x1;
        let deltaY = y2 - y1;
        let absX = Math.abs(deltaX);
        let absY = Math.abs(deltaY);

        let diagInfo = {
            angle: calcAngle(0, 0, Math.sign(deltaX), Math.sign(deltaY)),
            steps: Math.min(absX, absY),
            stepSize: STEP_SIZES.DIAGONAL,
        };
        let moveInfo = {
            angle: absX > absY ? this.getXAngle(deltaX) : this.getYAngle(deltaY),
            steps: Math.abs(absX - absY),
            stepSize: STEP_SIZES.STANDARD,
        };

        let order = options.diagFirst ? [diagInfo, moveInfo] : [moveInfo, diagInfo];
        let movements = [];

        function addMovement(x, y, i) {
            let info = order[i];
            if (info.steps === 0) {
                return;
            }

            let duration = info.steps * options.beatsPerStep;
            options.stepSize = info.stepSize;
            let movement = new MovementCommandMove(x, y, info.angle, duration, options);
            movements.push(movement);
        }

        addMovement(x1, y1, 0);

        let midX, midY;
        if (movements.length === 0) {
            midX = x1;
            midY = y1;
        } else {
            let pos = movements[0].getEndPosition();
            midX = pos.x;
            midY = pos.y;
        }

        addMovement(midX, midY, 1);

        return movements;
    }

    get info() {
        let name = this._diagFirst ? "DMHS" : "HSDM";
        return {
            type: "diagonal",
            name: name,
            label: name,
        };
    }

    /**** METHODS ****/

    getContinuityText() {
        let directions = this._diagFirst ? "DHS/HS" : "HS/DHS";
        let end = this._getEndText();
        return `FM${directions} ${end}`;
    }

    getMovements(dot, data) {
        let start = data.position;
        let end = this._getNextPosition(dot);
        if (isNull(end)) {
            return [];
        }

        let options = {
            beatsPerStep: this.getBeatsPerStep(),
            diagFirst: this._diagFirst,
        };

        let movements = this.constructor.getDiagonalMoves(start.x, start.y, end.x, end.y, options);

        let remaining = this.sheet.getDuration();
        movements.forEach(movement => {
            remaining -= movement.getDuration();
        });
        this._addEnd(movements, remaining, end, options);

        return movements;
    }
}
