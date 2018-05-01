/**
 * @file Defines the Show class.
 *
 * A Calchart show contains all of the data necessary to edit, display, animate,
 * or print a show. Shows and all of the data contained in the Show implement
 * a `serialize` function, which convert the class into a JSON object that can
 * be sent to the server and saved in the database.
 */

import { defaults, range } from 'lodash';

import Serializable from 'utils/Serializable';

import Dot from './Dot';
import DotLabelFormat from './DotLabelFormat';
import FieldType from './FieldType';
import Formation from './Formation';
import Orientation from './Orientation';
import Song from './Song';
import StepType from './StepType';

/**
 * Increment this variable whenever an edit was made to any serializable
 * class (e.g. Show, Formation, Continuity, MovementCommand, etc.) that would
 * break deserialization. Examples of when NOT to increment this variable:
 *   - editing a method in a class
 *   - adding a MovementCommand or Continuity (adding a new deserialization
 *     option will not break old shows)
 *
 * After incrementing this variable, add a migration to update all Shows in
 * the database. See docs/Versioning.md for more details on this variable.
 */
const VERSION = 1;

export default class Show extends Serializable {
    /**
     * @param {Object} data
     *  // properties of the show
     *  | {number} version
     *  | {string} name
     *  | {string} slug
     *  | {boolean} isBand
     *  | {boolean} published
     *  | {number} numDots
     *  | {Object<string: number>} dotGroups
     *  | {DotLabelFormat} labelFormat
     *  // data contained in the show
     *  | {number[]} beats - Number of milliseconds between each beat
     *  | {?string} audioUrl
     *  | {Dot[]} dots
     *  | {Formation[]} formations
     *  | {Song[]} songs
     *  // defaults for entire show
     *  | {FieldType} fieldType
     *  | {[number, number]} beatsPerStep
     *  | {StepType} stepType
     *  | {Orientation} orientation
     */
    constructor(data) {
        super(data, {
            // properties of the show
            version: 'number',
            name: 'string',
            slug: 'string',
            isBand: 'boolean',
            published: 'boolean',
            numDots: 'number',
            dotGroups: {
                _type: 'mapping',
                _wraps: 'number',
            },
            labelFormat: DotLabelFormat,
            // data contained in the show
            beats: {
                _type: 'array',
                _wraps: 'number',
            },
            audioUrl: [null, 'string'],
            dots: {
                _type: 'array',
                _wraps: Dot,
            },
            formations: {
                _type: 'array',
                _wraps: Formation,
            },
            songs: {
                _type: 'array',
                _wraps: Song,
            },
            // defaults for entire show
            fieldType: FieldType,
            beatsPerStep: {
                _type: 'tuple',
                _wraps: ['number', 'number'],
            },
            stepType: StepType,
            orientation: Orientation,
        });

        if (this._version < VERSION) {
            alert(
                'WARNING: ' +
                'You are running an outdated version of a Calchart show!'
            );
        }
    }

    /**
     * @param {Object} data
     * @return {Show}
     */
    static create(data) {
        defaults(data, {
            version: VERSION,
            published: false,
            beats: [],
            dots: range(data.numDots).map(i => {
                return Dot.create({
                    label: data.labelFormat.getLabel(i),
                });
            }),
            formations: [],
        });

        return new this(data);
    }

    /**
     * Add a Formation to the Show.
     *
     * @param {Formation} formation
     */
    addFormation(formation) {
        this._formations.push(formation);
    }
}
