import AnimationState from 'calchart/AnimationState';
import BaseMovementCommand from 'calchart/movements/BaseMovementCommand';
import Coordinate from 'calchart/Coordinate';

import {
    calcAngle,
    calcDistance,
    calcRotatedXPos,
    calcRotatedYPos,
    roundSmall,
    wrap,
} from 'utils/MathUtils';

/**
 * A MovementCommand which represents a circular movement around an origin.
 */
export default class MovementCommandArc extends BaseMovementCommand {
    /**
     * @param {number} startX
     * @param {number} startY
     * @param {Coordinate} origin - The center of the rotation.
     * @param {int} degrees - The number of degrees to rotate around. Positive
     *   goes clockwise, negative goes counterclockwise.
     * @param {int} duration - The duration of the movement, in beats.
     * @param {object} [options] - Options for the movement, including:
     *   - {int} [beatsPerStep=1]
     */
    constructor(startX, startY, origin, degrees, duration, options) {
        super(startX, startY, null, null, duration, options);

        this._origin = origin;
        this._degrees = degrees;
        this._duration = duration;

        this._radius = calcDistance(origin.x, origin.y, startX, startY);
        if (this._radius === 0) {
            this._startAngle = 0;
        } else {
            this._startAngle = calcAngle(origin.x, origin.y, startX, startY);
        }

        let end = this.getAnimationState(duration);
        this._endX = end.x;
        this._endY = end.y;
    }

    static deserialize(data) {
        return new MovementCommandArc(
            data.startX,
            data.startY,
            data.origin,
            data.degrees,
            data.duration,
            data
        );
    }

    serialize() {
        return super.serialize('MovementCommandArc', {
            origin: this._origin,
            degrees: this._degrees,
            duration: this._duration,
        });
    }

    getAnimationState(beatNum) {
        if (beatNum < 0 || roundSmall(beatNum - this._duration) > 0) {
            return null;
        }

        let angle = this._startAngle + this._degrees / this._duration * beatNum;
        let x = calcRotatedXPos(angle) * this._radius + this._origin.x;
        let y = calcRotatedYPos(angle) * this._radius + this._origin.y;
        let position = new Coordinate(x, y);

        // dot facing perpendicular to origin
        let offset = Math.sign(this._degrees) * -90;
        let orientation = calcAngle(
            x, y, this._origin.x, this._origin.y
        ) + offset;

        return new AnimationState(position, wrap(orientation, 360));
    }

    /**
     * Get the 'd' attribute for this arc in a <path> element.
     *
     * @param {GrapherScale} scale
     * @return {string}
     */
    getPathDef(scale) {
        let r = scale.toDistance(this._radius);
        let largeArc = Math.abs(this._degrees) < 180 ? 0 : 1;
        let sweepFlag = this._degrees < 0 ? 0 : 1;
        let { x, y } = scale.toDistance(this.getEndPosition());
        return `A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${x} ${y}`;
    }

    /**
     * @return {string} The continuity text in the form 'GT CW 90 deg. (16
     *   steps)'.
     */
    getText() {
        let direction = this._degrees > 0 ? 'CW' : 'CCW';
        let degrees = Math.abs(this._degrees);
        let steps = this._duration / this._beatsPerStep;
        return `GT ${direction} ${degrees} deg. (${steps} steps)`;
    }
}
