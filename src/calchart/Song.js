/**
 * @file Defines the Song class.
 *
 * A Song contains song-wide information, such as the default orientation for
 * all Flows in a Song (i.e. a west-facing song). Songs also contain the first
 * Flow in the Song.
 */

import { assign } from 'lodash';

import { mapExist, uniqueId } from 'utils/JSUtils';
import Serializable from 'utils/Serializable';

import FieldType from './FieldType';
import Flow from './Flow';
import Orientation from './Orientation';
import StepType from './StepType';

export default class Song extends Serializable {
    /**
     * @param {Object} data
     *  | {string} id
     *  | {string} name
     *  | {?Flow} firstFlow
     *  // defaults for entire song
     *  | {?FieldType} fieldType
     *  | {?[number, number]} beatsPerStep
     *  | {?StepType} stepType
     *  | {?Orientation} orientation
     */
    constructor(data) {
        super(data, {
            id: 'string',
            name: 'string',
            firstFlow: [null, Flow],
            fieldType: [null, FieldType],
            beatsPerStep: [null, {
                _type: 'tuple',
                _wraps: ['number', 'number'],
            }],
            stepType: [null, StepType],
            orientation: [null, Orientation],
        });
    }

    /**
     * @param {Object} data
     * @return {Song}
     */
    static create(data) {
        assign(data, {
            id: uniqueId(),
            fieldType: null,
            beatsPerStep: null,
            stepType: null,
            orientation: null,
        });

        return new this(data);
    }

    /**
     * @param {string} k
     * @param {Any} v
     * @param {Show} show
     * @return {Any}
     */
    static _postDeserialize(k, v, show) {
        switch (k) {
            case 'firstFlow':
                return mapExist(v, id => show.getFlow(id));
            default:
                return super._postDeserialize(k, v);
        }
    }

    /**
     * @param {string} k
     * @param {Any} v
     * @return {Any}
     */
    _preSerialize(k, v) {
        switch (k) {
            case 'firstFlow':
                return mapExist(v, flow => flow.id);
            default:
                return super._preSerialize(k, v);
        }
    }
}
