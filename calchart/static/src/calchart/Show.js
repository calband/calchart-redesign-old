import * as _ from "lodash";

import Dot from "calchart/Dot";
import Sheet from "calchart/Sheet";
import Song from "calchart/Song";

/**
 * A Show represents a Calchart show, containing the following information:
 *  - a Dot object for each dot in the show
 *  - a Sheet object for each stuntsheet in the show
 *  - a Song object for each song in the show
 *  - the field type for the show (see base/constants.py)
 *  - the number of beats per step for the show
 *  - the step type for the Show (see CalchartUtils.STEP_TYPES)
 *  - the orientation of the Show (east-facing or west-facing)
 */
export default class Show {
    /**
     * @param {Dot[]} dots - Every Dot marching in the Show.
     * @param {Sheet[]} sheets - Every Sheet contained in the Show.
     * @param {Song[]} songs - Every Song in the Show.
     * @param {string} fieldType - The show's field type (see base/constants.py).
     * @param {Object} [options] - Other options to customize the Show:
     *   - {int} [beatsPerStep=1] - The default number of beats per step for the
     *     entire Show.
     *   - {string} [stepType=HS] - The default step type for the entire Show
     *     (@see CalchartUtils.STEP_TYPES).
     *   - {string} [orientation=east] - The default orientation for the entire
     *     Show (@see CalchartUtils.ORIENTATIONS).
     */
    constructor(dots, sheets, songs, fieldType, options={}) {
        this._dots = _.fromPairs(dots.map(
            dot => [dot.getLabel(), dot]
        ));

        this._sheets = sheets;
        this._songs = songs;
        this._fieldType = fieldType;

        options = _.defaults(options, {
            beatsPerStep: 1,
            stepType: "HS",
            orientation: "east",
        });

        this._beatsPerStep = options.beatsPerStep;
        this._stepType = options.stepType;
        this._orientation = options.orientation;
    }

    /**
     * Create a new Show from the given data, parsed from the Set Up Show
     * popup.
     *
     * @param {Object} data - The form data from the setup-show popup.
     * @return {Show}
     */
    static create(data) {
        let getLabel;
        switch (data.dot_format) {
            case "combo":
                getLabel = function(n) {
                    // 65 = "A"
                    let charCode = 65 + (n / 10);
                    let num = n % 10;
                    return String.fromCharCode(charCode) + num;
                };
                break;
            case "number":
                getLabel = function(n) {
                    return String(n);
                };
                break;
        }

        let dots = _.range(data.num_dots).map(
            i => new Dot(getLabel(i))
        );

        return new Show(dots, [], [], data.field_type);
    }

    /**
     * Create a Show from the given serialized data
     *
     * @param {Object} data - The JSON data to initialize the Show with.
     * @return {Show}
     */
    static deserialize(data) {
        let dots = data.dots.map(data => Dot.deserialize(data));
        let sheets = data.sheets.map(data => Sheet.deserialize(this, data));
        let songs = data.songs.map(data => Song.deserialize(data));
        return new Show(dots, sheets, songs, data.fieldType, data);
    }

    /**
     * Return the JSONified version of the Show.
     *
     * @return {Object}
     */
    serialize() {
        let data = {
            fieldType: this._fieldType,
            beatsPerStep: this._beatsPerStep,
            stepType: this._stepType,
            orientation: this._orientation,
        };

        data.dots = _.values(this._dots).map(dot => dot.serialize());
        data.sheets = this._sheets.map(sheet => sheet.serialize());
        data.songs = this._songs.map(song => song.serialize());

        return data;
    }

    /**
     * @return {int} The default number of beats per step for the entire show.
     */
    getBeatsPerStep() {
        return this._beatsPerStep;
    }

    /**
     * @return {string} The default field type for the entire show.
     */
    getFieldType() {
        return this._fieldType;
    }

    /**
     * @return {int} The default orientation of the entire Show, in Calchart degrees.
     */
    getOrientation() {
        switch (this._orientation) {
            case "east":
                return 0;
            case "west":
                return 90;
        }
        throw new Error(`Invalid orientation: ${this._orientation}`);
    }

    /**
     * @return {string} The default step type for the entire show. (see
     *   CalchartUtils.STEP_TYPES)
     */
    getStepType() {
        return this._stepType;
    }

    /**** DOTS ****/

    /**
     * @return {Dot[]} Every Dot in the show.
     */
    getDots() {
        return _.values(this._dots);
    }

    /**
     * @return {string[]} The labels of every dots in show.
     */
    getDotLabels() {
        return _.keys(this._dots);
    }

    /**
     * Get dot by its label.
     *
     * @param {string} label - The label of the dot to get.
     * @return {Dot}
     */
    getDotByLabel(label) {
        return this._dots[label];
    }

    /**** SHEETS ****/

    /**
     * @return {Sheet[]} All stuntsheets in the Show.
     */
    getSheets() {
        return this._sheets;
    }

    /**
     * Add a stuntsheet to the show with the given number of beats.
     *
     * @param {int} numBeats - The number of beats for the stuntsheet.
     * @return {Sheet}
     */
    addSheet(numBeats) {
        let index = this._sheets.length;
        let sheet = Sheet.create(this, index, numBeats, this.getDotLabels());
        this._sheets.push(sheet);
        return sheet;
    }

    /**
     * Insert the given stuntsheet at the given index.
     *
     * @param {Sheet} sheet
     * @param {int} index
     */
    insertSheet(sheet, index) {
        this._sheets.splice(index, 0, sheet);
        _.range(index + 1, this._sheets.length).forEach(
            i => this._sheets[i].setIndex(i)
        );
    }

    /**
     * Remove the given stuntsheet from the show.
     *
     * @param {Sheet} sheet
     */
    removeSheet(sheet) {
        for (let i = 0; i < this._sheets.length; i++) {
            let _sheet = this._sheets[i];
            if (_sheet === sheet) {
                _.pullAt(this._sheets, i);
                i--;
            } else {
                _sheet.setIndex(i);
            }
        }
    }

    /**** SONGS ****/
    // TODO
}
