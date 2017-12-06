import { isNull } from 'lodash';

import ToEndContinuity from "calchart/continuities/ToEndContinuity";
import MovementCommandMove from "calchart/movements/MovementCommandMove";

import { roundSmall } from "utils/MathUtils";

/**
 * An EWNS or NSEW continuity, where dots move as far EW or NS as possible,
 * then move NS or EW to get to their next position.
 */
export default class FountainGridContinuity extends ToEndContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {boolean} isEWNS - true if EWNS, otherwise NSEW.
     * @param {Object} [options]
     */
    constructor(sheet, dotType, isEWNS, options={}) {
        super(sheet, dotType, options);

        this._isEWNS = isEWNS;
    }

    static deserialize(sheet, dotType, data) {
        return new FountainGridContinuity(sheet, dotType, data.ewns, data);
    }

    serialize() {
        return super.serialize({
            ewns: this._isEWNS,
        });
    }

    static getXAngle(deltaX) {
        return deltaX < 0 ? 90 : 270;
    }

    static getYAngle(deltaY) {
        return deltaY < 0 ? 180 : 0;
    }

    get info() {
        let name = this._isEWNS ? "EWNS" : "NSEW";
        return {
            type: "fountain",
            name: name,
            label: name,
        };
    }

    /**** METHODS ****/

    getContinuityText() {
        let directions = this._isEWNS ? "EW/NS" : "NS/EW";
        let end = this._getEndText();
        return `FM${this.getStepType()} ${directions} ${end}`;
    }

    getMovements(dot, data) {
        let start = data.position;
        let end = this._getNextPosition(dot);
        if (isNull(end)) {
            return [];
        }

        let deltaX = roundSmall(end.x - start.x);
        let deltaY = roundSmall(end.y - start.y);
        let dirX = this.constructor.getXAngle(deltaX);
        let dirY = this.constructor.getYAngle(deltaY);

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
}
