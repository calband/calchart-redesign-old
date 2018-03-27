/**
 * @file Defines the BaseContinuity superclass.
 *
 * Represents a continuity for a dot type in a Flow. This is distinct from
 * Movements, as those are per-dot, and describe the exact movement for the dot
 * (e.g. 8E, 4S), whereas continuities describe movements for the dot type (e.g.
 * EWNS to SS 2).
 */

import { assign, defaults } from 'lodash';

import FieldType from 'calchart/FieldType';
import Orientation from 'calchart/Orientation';
import StepType from 'calchart/StepType';
import { uniqueId } from 'utils/JSUtils';
import Serializable from 'utils/Serializable';

export default class BaseContinuity extends Serializable {
    /**
     * @param {Object} data
     *  | {string} id
     *  // options with defaults resolved from Formation, Song, then Show
     *  | {?FieldType} fieldType
     *  | {?[number, number]} beatsPerStep
     *  | {?StepType} stepType
     *  | {?Orientation} orientation
     * @param {Object} types
     */
    constructor(data, types) {
        super(data, assign(types, {
            id: 'string',
            fieldType: [null, FieldType],
            beatsPerStep: [null, {
                _type: 'tuple',
                _wraps: ['number', 'number'],
            }],
            stepType: [null, StepType],
            orientation: [null, Orientation],
        }));
    }

    /**
     * @param {Object} data
     * @return {BaseContinuity}
     */
    static create(data) {
        defaults(data, {
            id: uniqueId(),
            fieldType: null,
            beatsPerStep: null,
            stepType: null,
            orientation: null,
        });

        return new this(data);
    }
}
