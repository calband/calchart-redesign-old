import AnimationState from "calchart/AnimationState";
import BaseMovementCommand from "calchart/movements/BaseMovementCommand";
import Coordinate from "calchart/Coordinate";

import { STEP_SIZES } from "utils/CalchartUtils";
import { calcRotatedXPos, calcRotatedYPos, roundSmall } from "utils/MathUtils";

/**
 * A MovementCommand which represents a constant movement in the given direction.
 */
export default class MovementCommandMove extends BaseMovementCommand {
    /**
     * @param {number} startX
     * @param {number} startY
     * @param {number} direction - The direction toward which the dot will move,
     *   in Calchart degrees.
     * @param {int} duration - The duration of the movement, in beats.
     * @param {object} [options] - Options for the movement, including:
     *   - {number} [stepSize=STEP_SIZES.STANDARD] - The multiplier for converting steps
     *     into standard step sizes. @see STEP_SIZES.
     *   - {number} [orientation=direction]
     *   - {int} beatsPerStep
     */
    constructor(startX, startY, direction, duration, options={}) {
        options = _.defaults({}, options, {
            stepSize: STEP_SIZES.STANDARD,
            orientation: direction,
        });

        super(startX, startY, null, null, duration, options);

        this._stepSize = options.stepSize;
        this._direction = direction;
        this._deltaXPerStep = calcRotatedXPos(direction) * this._stepSize;
        this._deltaYPerStep = calcRotatedYPos(direction) * this._stepSize;

        let end = this._getPosition(duration);
        this._endX = end.x;
        this._endY = end.y;
    }

    static deserialize(data) {
        return new MovementCommandMove(
            data.startX,
            data.startY,
            data.direction,
            data.duration,
            data
        );
    }

    serialize() {
        return super.serialize("MovementCommandMove", {
            direction: this._direction,
            stepSize: this._stepSize,
        });
    }

    getAnimationState(beatNum) {
        if (beatNum < 0 || roundSmall(beatNum - this._duration) > 0) {
            return null;
        }

        let position = this._getPosition(beatNum);
        return new AnimationState(position, this._orientation);
    }

    /**
     * @return {number}
     */
    getDirection() {
        return this._direction;
    }

    /**
     * @return {string} The continuity text in the form "Move 4 E".
     */
    getText() {
        let deltaX = this._endX - this._startX;
        let deltaY = this._endY - this._startY;
        let dirX = (deltaX < 0) ? "S" : "N";
        let dirY = (deltaY < 0) ? "W" : "E";

        // This movement can only move in one direction
        if (deltaX === 0) {
            return `Move ${Math.abs(deltaY)} ${dirY}`;
        } else {
            return `Move ${Math.abs(deltaX)} ${dirX}`;
        }
    }

    /**
     * Update the duration to the given value.
     *
     * @param {int} duration
     */
    setDuration(duration) {
        this._duration = duration;

        let end = this._getPosition(duration);
        this._endX = end.x;
        this._endY = end.y;
    }

    /**** HELPERS ****/

    /**
     * Get the coordinate the dot will be at at the given beat
     *
     * @param {int} beatNum - The number of beats relative to the start of the movement.
     * @return {Coordinate}
     */
    _getPosition(beatNum) {
        let numSteps = Math.floor(beatNum / this._beatsPerStep);
        let x = this._startX + this._deltaXPerStep * numSteps;
        let y = this._startY + this._deltaYPerStep * numSteps;

        // rounding errors
        x = roundSmall(x);
        y = roundSmall(y);

        return new Coordinate(x, y);
    }
}
