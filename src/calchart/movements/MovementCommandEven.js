import MovementCommandMove from "calchart/movements/MovementCommandMove";

import { calcAngle, calcDistance } from "utils/MathUtils";
 
/**
 * A MovementCommand which represents an even-step transition between two points.
 */
export default class MovementCommandEven extends MovementCommandMove {
    /**
     * @param {number} startX
     * @param {number} startY
     * @param {number} endX
     * @param {number} endY
     * @param {int} duration
     * @param {object} options - Options for the movement, including:
     *   - {number} [orientation=direction]
     *   - {int} [beatsPerStep=1]
     */ 
    constructor(startX, startY, endX, endY, duration, options={}) {
        let direction = calcAngle(startX, startY, endX, endY);
        if (_.isNaN(direction)) {
            direction = 0;
        }

        options.stepSize = calcDistance(startX, startY, endX, endY) / duration;

        super(startX, startY, direction, duration, options);
    }

    static deserialize(data) {
        return new MovementCommandEven(
            data.startX,
            data.startY,
            data.endX,
            data.endY,
            data.duration,
            data
        );
    }

    serialize() {
        let data = super.serialize();
        data.type = "MovementCommandEven";
        return data;
    }

    /**
     * @return {string} The continuity text in the form "Even 8 E, 4 S" or "Move 8 NE" if
     * in one direction.
     */
    getContinuityText() {
        let deltaX = this._endX - this._startX;
        let deltaY = this._endY - this._startY;
        let dirX = (deltaX < 0) ? "S" : "N";
        let dirY = (deltaY < 0) ? "W" : "E";
        let steps = this._duration / this._beatsPerStep;

        deltaX = Math.abs(deltaX);
        deltaY = Math.abs(deltaY);

        // Check if movement only in one direction and same number of steps as change in position
        if (deltaX == 0 && deltaY == steps) {
            return `Move ${steps} ${dirY}`;
        } else if (deltaY == 0 && deltaX == steps) {
            return `Move ${steps} ${dirX}`;
        } else if (deltaY == deltaX && deltaX == steps) { // Diagonal
            return `Move ${steps} ${dirX}${dirY}`;
        }

        let text;
        // If movement is a fraction of steps, simply say "NE" or "S"
        if (deltaX % 1 !== 0 || deltaY % 1 !== 0) {
            text = (deltaX !== 0) ? dirX : "";
            text = (deltaY !== 0) ? dirY : "";
        } else {
            // End result will be concat. of directions, e.g. "Even 8E, 4S"
            let moveTexts = [];
            if (deltaY != 0) {
                moveTexts.push(`${deltaY} ${dirY}`);
            }
            if (deltaX != 0) {
                moveTexts.push(`${deltaX} ${dirX}`);
            }
            text = moveTexts.join(", ");
        }

        // Error checking for an even move without movement in any direction
        if (_.isUndefined(text)) {
            text = "0";
        }

        return `Even ${text} (${steps} steps)`;
    }
}
