/**
 * @file Defines the Flow class.
 *
 * A Flow is the transitionary movement within a Formation, from one
 * intermediate formation to the next.
 */

import { defaults } from 'lodash';

import { uniqueId } from 'utils/JSUtils';
import Serializable from 'utils/Serializable';

import BaseContinuity from './continuities/BaseContinuity';
import { StepCoordinate } from './Coordinate';
import DotType from './DotType';
import BaseMovement from './movements/BaseMovement';

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
        super(data, {
            id: 'string',
            dots: {
                _type: 'mapping',
                _wraps: {
                    nextPoint: StepCoordinate,
                    dotType: DotType,
                    movements: {
                        _type: 'array',
                        _wraps: BaseMovement,
                    },
                },
            },
            dotTypeInfo: {
                _type: 'mapping',
                _wraps: {
                    continuities: {
                        _type: 'array',
                        _wraps: BaseContinuity,
                    },
                    hasNextPoint: 'boolean',
                },
            },
        });
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
}
