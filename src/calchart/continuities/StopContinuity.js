/**
 * @file Defines the StopContinuity class.
 *
 * Dot types with this continuity do not move for the specified duration. If
 * duration is set to null, do not move for the remaining number of beats in the
 * Flow.
 */

import BaseContinuity from './BaseContinuity';

export default class StopContinuity extends BaseContinuity {
    /**
     * @param {Object} data
     *  | {boolean} isMarkTime
     *  | {?int} duration
     *  // inherited from BaseContinuity
     *  | {string} id
     *  | {?FieldType} fieldType
     *  | {?[number, number]} beatsPerStep
     *  | {?StepType} stepType
     *  | {?Orientation} orientation
     */
    constructor(data) {
        super(data);
    }
}
