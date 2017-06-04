import AnimationState from "calchart/AnimationState";
import BaseMovementCommand from "calchart/movements/BaseMovementCommand";

import { roundSmall } from "utils/MathUtils";

/**
 * A MovementCommand which represents no motion.
 */
export default class MovementCommandStop extends BaseMovementCommand {
    /**
     * @param {number} startX
     * @param {number} startY
     * @param {number} orientation - The direction the dot will face, in Calchart degrees.
     * @param {int} duration
     * @param {boolean} isMarkTime - true if marking time, false if close.
     * @param {object} [options] - Options for the movement, including:
     *   - {int} [beatsPerStep=1]
     */
    constructor(startX, startY, orientation, duration, isMarkTime, options={}) {
        options.orientation = orientation;

        super(startX, startY, startX, startY, duration, options);

        this._isMarkTime = isMarkTime;
    }

    static deserialize(data) {
        return new MovementCommandStop(
            data.startX,
            data.startY,
            data.orientation,
            data.duration,
            data.isMarkTime,
            data
        );
    }

    serialize() {
        return super.serialize("MovementCommandStop", {
            isMarkTime: this._isMarkTime,
        });
    }

    getAnimationState(beatNum) {
        if (beatNum < 0 || roundSmall(beatNum - this._duration) > 0) {
            return null;
        }
        return new AnimationState(this.getStartPosition(), this._orientation);
    }

    /**
     * @return {string} The continuity text in the form "MT 4 E" or "Close".
     */
    getContinuityText() {
        if (this._isMarkTime) {
            let steps = this._duration / this._beatsPerStep;
            let orientation = this.getOrientation();
            return `MT ${steps} ${orientation}`;
        } else {
            return "Close";
        }
    }
}
