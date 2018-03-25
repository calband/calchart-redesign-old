/**
 * @file Defines the StopMovement class.
 *
 * Represents an instruction to not move.
 */

import { defaults } from 'lodash';

import BaseMovement from './BaseMovement';

export default class StopMovement extends BaseMovement {
    /**
     * @param {Object} data
     *  | {boolean} isMarkTime
     *  // inherited from BaseMovement
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
     * @param {number} x
     * @param {number} y
     * @param {Object} data
     * @return {StopMovement}
     */
    static create(x, y, data) {
        defaults(data, {
            startX: x,
            startY: y,
            endX: x,
            endY: y,
        });

        return super.create(data);
    }
}
