/**
 * @file Defines the Flow class.
 *
 * A Flow is the transitionary movement within a Formation, from one
 * intermediate formation to the next.
 */

import { defaults } from 'lodash';

import { uniqueId } from 'utils/JSUtils';
import Serializable from 'utils/Serializable';

// import { StepCoordinate } from './Coordinate';
// import DotType from './DotType';

export default class Flow extends Serializable {
    /**
     * @param {Object} data
     *  | {string} id
     *  | {Object<FormationDot: Object>} dots
     *      | {StepCoordinate} nextPoint
     *      | {DotType} dotType
     *      | {BaseMovement[]} movements
     *  | {Object<DotType: Object>} dotTypeInfo
     *      | {BaseContinuity[]} continuities
     *      | {boolean} hasNextPoint
     */
    constructor(data) {
        super(data);
    }

    /**
     * @param {Object} data
     * @return {Flow}
     */
    static create(data) {
        defaults(data, {
            id: uniqueId(),
        });

        return new this(data);
    }

    /**
     * @return {string}
     */
    get id() {
        return this._id;
    }
}
