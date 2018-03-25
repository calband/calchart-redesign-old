/**
 * @file Defines the FormationDot class.
 *
 * A FormationDot is a "pixel" in a Formation. FormationDots are the first
 * component of a Formation that the user defines, and they represent a single
 * dot within a Formation.
 */

import { defaults } from 'lodash';

import { mapExist, uniqueId } from 'utils/JSUtils';
import Serializable from 'utils/Serializable';

// import { PixelCoordinate } from './Coordinate';

export default class FormationDot extends Serializable {
    /**
     * @param {Object} data
     *  | {string} id
     *  | {StepCoordinate} position
     *  | {?string} dotGroup - One of Show.dotGroups
     *  | {?Dot} dot
     */
    constructor(data) {
        super(data);
    }

    /**
     * @param {Object} data
     * @return {Dot}
     */
    static create(data) {
        defaults(data, {
            id: uniqueId(),
        });

        return new this(data);
    }

    /**
     * @param {string} k
     * @param {Show} show
     * @return {Any}
     */
    static _postDeserialize(k, v, show) {
        switch (k) {
            case 'dot':
                return mapExist(v, id => show.getDot(id));
            default:
                return super._postDeserialize(k, v);
        }
    }

    /**
     * @return {string}
     */
    get id() {
        return this._id;
    }

    /**
     * @param {string} k
     * @param {Any} v
     * @return {Any}
     */
    _preSerialize(k, v) {
        switch (k) {
            case 'dot':
                return mapExist(v, dot => dot.id);
            default:
                return super._preSerialize(k, v);
        }
    }
}
