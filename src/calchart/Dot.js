/**
 * @file Defines the Dot class.
 *
 * A Dot represents a dot throughout the entire show, and contains information
 * that stays consistent throughout the show. Each Formation will assign each
 * Dot to a FormationDot.
 *
 * TODO: Dots should be assigned Members Only users when the blocklisting
 * feature is implemented.
 */

import { defaults } from 'lodash';

import { uniqueId } from 'utils/JSUtils';
import Serializable from 'utils/Serializable';

export default class Dot extends Serializable {
    /**
     * @param {Object} data
     *  | {string} id
     *  | {string} label
     */
    constructor(data) {
        super(data, {
            id: 'string',
            label: 'string',
        });
    }

    /**
     * Create a Dot with the given parameters.
     *
     * @param {Object} data
     * @return {Dot}
     */
    static create(data) {
        defaults(data, {
            id: uniqueId(),
        });

        return new this(data);
    }
}
