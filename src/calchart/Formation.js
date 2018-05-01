/**
 * @file Defines the Formation class.
 *
 * A Formation is an image or shape in a show, with no relationship to another
 * image or shape in the show. Formations contain Flows that describe how to
 * animate the image or shape through intermediate formations. Formations also
 * contain the FormationDots that make up the formation and the FormationDot
 * in the next Formation each FormationDot corresponds to (if applicable).
 *
 * For example, a face might be a Formation, where you have flows that animate
 * the face from smiling to frowning. Since you care about the movements of the
 * dots (e.g. dots in the mouth should stay in the mouth), that would be within
 * one Formation.
 *
 * On the other hand, if the next Formation is a couple stars on the field and
 * you don't care how the dots move from the previous formation, this is a
 * separate Formation.
 */

import { defaults, defaultTo } from 'lodash';

import { uniqueId } from 'utils/JSUtils';
import Serializable from 'utils/Serializable';

import FieldType from './FieldType';
import Flow from './Flow';
import FormationDot from './FormationDot';
import Orientation from './Orientation';
import StepType from './StepType';

export default class Formation extends Serializable {
    /**
     * @param {Object} data
     *  | {string} id
     *  | {string} name
     *  | {FormationDot[]} dots
     *  | {Flow[]} flows
     *  | {?Object<FormationDot: FormationDot>} nextDots
     *  // defaults for entire formation
     *  | {?FieldType} fieldType
     *  | {?[number, number]} beatsPerStep
     *  | {?StepType} stepType
     *  | {?Orientation} orientation
     */
    constructor(data) {
        super(data, {
            id: 'string',
            name: 'string',
            dots: {
                _type: 'array',
                _wraps: FormationDot,
            },
            flows: {
                _type: 'array',
                _wraps: Flow,
            },
            nextDots: [null, {
                _type: 'mapping',
                _wraps: FormationDot,
            }],
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
     * @return {Formation}
     */
    static create(data) {
        defaults(data, {
            id: uniqueId(),
            dots: [],
            flows: [],
            nextDots: {},
            fieldType: null,
            beatsPerStep: null,
            stepType: null,
            orientation: null,
        });

        return new this(data);
    }

    /**
     * @param {Show} show
     * @return {FieldType} The field type, or the Show's field type if null.
     */
    getFieldType(show) {
        return defaultTo(this.fieldType, show.fieldType);
    }
}
