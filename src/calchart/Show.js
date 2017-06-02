import Dot from "calchart/Dot";
import Sheet from "calchart/Sheet";
import Song from "calchart/Song";

import { getDotLabels } from "utils/CalchartUtils";
import { moveElem } from "utils/JSUtils";

/**
 * Increment this variable whenever an edit was made to any serializable
 * class (e.g. Show, Sheet, Dot, Continuity, MovementCommand, etc.) that would
 * break deserialization. Examples of when NOT to increment this variable:
 *   - editing a method in a class
 *   - adding a MovementCommand or Continuity (adding a new deserialization
 *     option will not break old shows)
 *
 * After incrementing this variable, add a migration to update all Shows in
 * the database. See docs/Versioning.md for more details on this variable.
 */
const VERSION = 5;

/**
 * A Show represents a Calchart show, containing the following information:
 *  - the name of the show
 *  - the slug for the show
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
     * @param {Object} metadata - Any relevant metadata about a Show including:
     *   - {string} name - The name of the show.
     *   - {string} slug - The slug of the show.
     *   - {string} dotFormat - The format used to label the dots.
     *   - {int} version - The version of the Show.
     * @param {Object[]} dots - The serialized data for every Dot marching in the Show.
     * @param {Object[]} sheets - The serialized data for every Sheet contained in the Show.
     * @param {Object[]} songs - The serialized data for every Song in the Show.
     * @param {string} fieldType - The show's field type (see base/constants.py).
     * @param {Object} [options] - Other options to customize the Show:
     *   - {int} [beatsPerStep=1] - The default number of beats per step for the
     *     entire Show.
     *   - {string} [stepType=HS] - The default step type for the entire Show
     *     (@see CalchartUtils.STEP_TYPES).
     *   - {string} [orientation=east] - The default orientation for the entire
     *     Show (@see CalchartUtils.ORIENTATIONS).
     */
    constructor(metadata, dots, sheets, songs, fieldType, options={}) {
        this._name = metadata.name;
        this._slug = metadata.slug;
        this._isBand = metadata.isBand;
        this._dotFormat = metadata.dotFormat;
        this._version = metadata.version;

        if (this._version < VERSION) {
            alert("WARNING: You are running an outdated version of a Calchart show!");
        }

        this._dots = dots.map(data => Dot.deserialize(data));
        this._sheets = sheets.map(data => Sheet.deserialize(this, data));
        this._songs = songs.map(data => Song.deserialize(this, data));
        this._fieldType = fieldType;

        options = _.defaults({}, options, {
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
     * @param {string} name - The name of the show.
     * @param {string} slug - The slug of the show.
     * @param {boolean} isBand - true if the show is a band show.
     * @param {Object} data - The form data from the setup-show popup.
     * @return {Show}
     */
    static create(name, slug, isBand, data) {
        let dots = getDotLabels(data.dotFormat, data.numDots).map(
            (label, i) => new Dot(i, label).serialize()
        );
        let metadata = {
            name: name,
            slug: slug,
            isBand: isBand,
            dotFormat: data.dotFormat,
            version: VERSION,
        };

        return new Show(metadata, dots, [], [], data.fieldType);
    }

    /**
     * Create a Show from the given serialized data
     *
     * @param {Object} data - The JSON data to initialize the Show with.
     * @return {Show}
     */
    static deserialize(data) {
        return new Show(data, data.dots, data.sheets, data.songs, data.fieldType, data);
    }

    /**
     * Return the JSONified version of the Show.
     *
     * @return {Object}
     */
    serialize() {
        let data = {
            name: this._name,
            slug: this._slug,
            isBand: this._isBand,
            dotFormat: this._dotFormat,
            version: this._version,
            fieldType: this._fieldType,
            beatsPerStep: this._beatsPerStep,
            stepType: this._stepType,
            orientation: this._orientation,
        };

        data.dots = this._dots.map(dot => dot.serialize());
        data.sheets = this._sheets.map(sheet => sheet.serialize());
        data.songs = this._songs.map(song => song.serialize());

        return data;
    }

    get name() {
        return this._name;
    }

    get slug() {
        return this._slug;
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
     * @return {string} The default orientation of the entire Show.
     */
    getOrientation() {
        return this._orientation;
    }

    /**
     * @return {int} The default orientation of the entire Show, in Calchart degrees.
     */
    getOrientationDegrees() {
        switch (this._orientation) {
            case "east":
                return 0;
            case "west":
                return 180;
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
     * Get dot by its ID.
     *
     * @param {int} id - The ID of the dot to get.
     * @return {Dot}
     */
    getDot(id) {
        return this._dots[id];
    }

    /**
     * @return {Dot[]} Every Dot in the show.
     */
    getDots() {
        return this._dots;
    }

    /**** SHEETS ****/

    /**
     * Add a stuntsheet to the show with the given number of beats.
     *
     * @param {int} numBeats - The number of beats for the stuntsheet.
     * @return {Sheet}
     */
    addSheet(numBeats) {
        let index = this._sheets.length;
        let sheet = Sheet.create(this, index, numBeats, this._dots.length);

        this._sheets.push(sheet);
        this.updateMovements(index - 1);

        return sheet;
    }

    /**
     * Get the Sheet at the given index
     *
     * @param {number} i
     * @return {Sheet}
     */
    getSheet(i) {
        return this._sheets[i];
    }

    /**
     * @return {Sheet[]} All stuntsheets in the Show.
     */
    getSheets() {
        return this._sheets;
    }

    /**
     * Insert the given sheet at the given index.
     *
     * @param {Sheet} sheet
     * @param {int} index
     */
    insertSheet(sheet, index) {
        this._sheets.splice(index, 0, sheet);

        _.range(index, this._sheets.length).forEach(i => {
            this._sheets[i].setIndex(i);
        });

        this.updateMovements(index - 1, index);
    }

    /**
     * @return {boolean} true if this show is for the band.
     */
    isForBand() {
        return this._isBand;
    }

    /**
     * Move the stuntsheet at the given index to the specified index.
     *
     * @param {int} from - The index of the stuntsheet to move.
     * @param {int} to - The index to move to.
     */
    moveSheet(from, to) {
        moveElem(this._sheets, from, to);

        this._sheets.forEach((sheet, i) => {
            sheet.setIndex(i);
        });

        this.updateMovements(from - 1, to - 1, to);
    }

    /**
     * Remove the given stuntsheet from the show.
     *
     * @param {Sheet} sheet
     */
    removeSheet(sheet) {
        let i = this._sheets.indexOf(sheet);
        _.pullAt(this._sheets, i);

        _.range(i, this._sheets.length).forEach(i => {
            this._sheets[i].setIndex(i);
        });

        this.updateMovements(i - 1);
    }

    /**
     * Update the movements of the sheets at the given indices.
     *
     * @param {...int} [indices] - Defaults to all sheets in the show.
     */
    updateMovements(...indices) {
        if (indices.length === 0) {
            indices = _.range(0, this._sheets.length);
        }

        indices.forEach(i => {
            let sheet = this._sheets[i];
            if (sheet) {
                sheet.updateMovements();
            }
        });
    }

    /**** SONGS ****/

    /**
     * Add a song to the Show.
     *
     * @param {Song} song
     */
    addSong(song) {
        this._songs.push(song);
    }

    /**
     * Get the song with the given name or at the given index.
     *
     * @param {(int|string)} param - Either the index of the song
     *   or the name of the song.
     * @return {Song}
     */
    getSong(param) {
        if (_.isNumber(param)) {
            return this._songs[param];
        } else {
            return _.find(this._songs, song => song.getName() === param);
        }
    }

    /**
     * Get all songs in the show.
     *
     * @return {Song[]}
     */
    getSongs() {
        return this._songs;
    }

    /**
     * Move the song at the given index to the specified index.
     *
     * @param {int} from - The index of the song to move.
     * @param {int} to - The index to move to.
     */
    moveSong(from, to) {
        moveElem(this._songs, from, to);
    }

    /**
     * Remove a song from the Show.
     *
     * @param {Song} song
     */
    removeSong(song) {
        song.getSheets().forEach(sheet => {
            sheet.setSong(null);
            sheet.updateMovements();
        });

        _.pull(this._songs, song);
    }
}
