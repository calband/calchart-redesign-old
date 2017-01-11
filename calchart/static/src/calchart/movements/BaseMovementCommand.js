import Coordinate from "calchart/Coordinate";

import { getOrientation } from "utils/CalchartUtils";
import { NotImplementedError } from "utils/errors";
import { setDefaults } from "utils/JSUtils";

/**
 * Represents an individual movement that a dot executes during a
 * show. Needs to be subclassed by a class representing a specific
 * type of movement command.
 */
export default class BaseMovementCommand {
    /**
     * @param {number} startX - The x-coordinate where the movement starts.
     * @param {number} startY - The y-coordinate where the movement starts.
     * @param {number} endX - The x-coordinate where the movement ends.
     * @param {number} endY - The y-coordinate where the movement ends.
     * @param {int} duration - The duration of the movement, in beats.
     * @param {object} [options] - Options for all/most movements, including:
     *   - {float} [orientation] - The direction toward which the dot will face,
     *     while moving, in Calchart degrees.
     *   - {int} [beatsPerStep=1] - The number of beats per each step of the movement.
     */
    constructor(startX, startY, endX, endY, duration, options={}) {
        this._startX = startX;
        this._startY = startY;
        this._endX = endX;
        this._endY = endY;
        this._duration = duration;

        options = setDefaults(options, {
            orientation: undefined,
            beatsPerStep: 1,
        });

        this._orientation = options.orientation;
        this._beatsPerStep = options.beatsPerStep;
    }

    /**
     * Create a MovementCommand from the given serialized data.
     *
     * @param {Object} data - The JSON data to initialize the MovementCommand with.
     * @return {MovementCommand}
     */
    static deserialize(data) {
        throw new NotImplementedError(this);
    }

    /**
     * Return the JSONified version of this MovementCommand.
     *
     * @param {string} type - The type of the MovementCommmand (@see MovementCommand.deserialize).
     * @param {Object} [data] - Additional data to add to the serialized data.
     * @return {Object}
     */
    serialize(type, data) {
        return $.extend({}, data, {
            type: type,
            startX: this._startX,
            startY: this._startY,
            endX: this._endX,
            endY: this._endY,
            duration: this._duration,
            orientation: this._orientation,
            beatsPerStep: this._beatsPerStep,
        });
    }

    /**
     * @return {Coordinate} The position where the movement begins.
     */
    getStartPosition() {
        return new Coordinate(this._startX, this._startY);
    }

    /**
     * @return {Coordinate} The position where the movement ends.
     */
    getEndPosition() {
        return new Coordinate(this._endX, this._endY);
    }

    /**
     * @return {int} The duration of this command, in beats.
     */
    getDuration() {
        return this._duration;
    }

    /**
     * @return {string=} The orientation of this movement, if applicable.
     */
    getOrientation() {
        if (this._orientation !== undefined) {
            return getOrientation(this._orientation);
        }
    }

    /**
     * Return an AnimationState describing the state of a dot that is executing
     * this movement.
     *
     * @param {int} beatNum - The number of beats relative to the start of
     *   the movement.
     * @return {?AnimationState} An AnimationState that describes a dot at a
     *   moment of the show. If the Dot has no movement at the specified beat,
     *   returns null.
     */
    getAnimationState(beatNum) {
        throw new NotImplementedError(this);
    }

    /**
     * @return {string} The continuity text to be displayed for this movement. Used
     * for individual continuities; use Continuity for dot type continuities.
     */
    getContinuityText() {
        throw new NotImplementedError(this);
    }
}
