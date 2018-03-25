/**
 * @file Defines the BaseMovement superclass.
 *
 * Represents an individual movement for a dot in a flow.
 */

import { defaults } from 'lodash';

import { StepCoordinate } from 'calchart/Coordinate';
import { uniqueId } from 'utils/JSUtils';
import Serializable from 'utils/Serializable';

export default class BaseMovement extends Serializable {
    /**
     * @param {Object} data
     *  | {string} id
     *  | {number} startX
     *  | {number} startY
     *  | {number} endX
     *  | {number} endY
     *  | {number} duration
     *  | {number} orientation
     *  | {number} beatsPerStep
     */
    constructor(data) {
        super(data);
    }

    /**
     * @param {Object} data
     * @return {BaseMovement}
     */
    static create(data) {
        defaults(data, {
            id: uniqueId(),
        });

        return new this(data);
    }

    /**
     * @return {StepCoordinate} The position where the movement begins.
     */
    getStart() {
        return new StepCoordinate(this._startX, this._startY);
    }

    /**
     * @return {StepCoordinate} The position where the movement ends.
     */
    getEnd() {
        return new StepCoordinate(this._endX, this._endY);
    }
}
