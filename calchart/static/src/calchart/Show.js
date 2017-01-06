/**
 * @fileOverview This file defines the Show class, which contains information
 * for a Calchart show. Functions in this file are organized in the following
 * sections:
 *
 * - Constructors (including serialization functions)
 * - General instance methods
 * - Dot instance methods (methods related to dots)
 * - Sheet instance methods (methods related to sheets)
 * - Song instance methods (methods related to songs)
 */

var Dot = require("./Dot");
var Sheet = require("./Sheet");
var Song = require("./Song");

/**** CONSTRUCTORS ****/

/**
 * A Show object contains all the data for a Calchart show, containing
 * the following information:
 *  - a Dot object for each dot in the show
 *  - a Sheet object for each stuntsheet in the show
 *  - a Song object for each song in the show
 *  - the field type for the show (see base/constants.py)
 *  - the number of beats per step for the show
 *  - the step type for the Show (see CalchartUtils.STEP_TYPES)
 *  - the orientation of the Show (east-facing or west-facing)
 *
 * @param {object} show_data -- the JSON data to initialize the Show with
 */
var Show = function(show_data) {
    var _this = this;

    this._dots = {};
    show_data.dots.forEach(function(dot_data) {
        var dot = Dot.deserialize(dot_data);
        this._dots[dot.getLabel()] = dot;
    }, this);

    this._sheets = show_data.sheets.map(function(sheet_data) {
        return Sheet.deserialize(_this, sheet_data);
    });
    this._songs = show_data.songs.map(function(song_data) {
        return Song.deserialize(song_data);
    });

    this._fieldType = show_data.fieldType;
    this._beatsPerStep = show_data.beatsPerStep;
    this._stepType = show_data.stepType;
    this._orientation = show_data.orientation;
};

/**
 * Create a new Show from the given data, parsed from the Set Up Show
 * popup.
 *
 * @param {object} data -- form data from the setup-show popup
 * @return {Show} the newly created Show object
 */
Show.create = function(data) {
    var dots = [];

    switch (data.dot_format) {
        case "combo":
            var getLabel = function(n) {
                // 65 = "A"
                var charCode = 65 + (n / 10);
                var num = n % 10;
                return String.fromCharCode(charCode) + num;
            };
            break;
        case "number":
            var getLabel = function(n) {
                return String(n);
            };
            break;
    }
    for (var i = 0; i < data.num_dots; i++) {
        var label = getLabel(i);
        var dot = new Dot(label);
        dots.push(dot.serialize());
    }

    return new Show({
        dots: dots,
        sheets: [],
        songs: [],
        fieldType: data.field_type,
        beatsPerStep: 1,
        stepType: "HS",
        orientation: "east",
    });
};

/**
 * Return the JSONified version of the Show
 *
 * @return {object} a JSON object containing this Show's data
 */
Show.prototype.serialize = function() {
    var data = {
        fieldType: this._fieldType,
        beatsPerStep: this._beatsPerStep,
        stepType: this._stepType,
        orientation: this._orientation,
    };

    data.dots = [];
    $.each(this._dots, function(label, dot) {
        data.dots.push(dot.serialize());
    });
    data.sheets = this._sheets.map(function(sheet) {
        return sheet.serialize();
    });
    data.songs = this._songs.map(function(song) {
        return song.serialize();
    });

    return data;
};

/**** INSTANCE METHODS ****/

/**
 * Get the number of beats per step for the show
 *
 * @return {int} beats per step
 */
Show.prototype.getBeatsPerStep = function() {
    return this._beatsPerStep;
};

/**
 * Get the field type of the show
 *
 * @return {string} the field type
 */
Show.prototype.getFieldType = function() {
    return this._fieldType;
};

/**
 * Get the orientation of the show
 *
 * @return {int} orientation, in Calchart degrees
 */
Show.prototype.getOrientation = function() {
    switch (this._orientation) {
        case "east":
            return 0;
        case "west":
            return 90;
    }
    throw new Error("Invalid orientation: " + this._orientation);
};

/**
 * Get the step type of the show
 *
 * @return {string} step type (see CalchartUtils.STEP_TYPES)
 */
Show.prototype.getStepType = function() {
    return this._stepType;
};

/**** DOTS ****/

/**
 * Get all Dots in the show
 *
 * @return {Array<Dot>} all Dots in the show
 */
Show.prototype.getDots = function() {
    return $.map(this._dots, function(dot) {
        return dot;
    });
};

/**
 * Get all dot labels
 *
 * @return {Array<string>} labels of all dots in show
 */
Show.prototype.getDotLabels = function() {
    return Object.keys(this._dots);
};

/**
 * Get the object mapping dot labels to the dot
 *
 * @return {object} dictionary mapping dot labels to Dot
 */
Show.prototype.getDotMapping = function() {
    return this._dots;
};

/**
 * Get dot by its label
 *
 * @param {string} label -- the label of the dot to get
 * @return {Dot} the dot with the given label
 */
Show.prototype.getDotByLabel = function(label) {
    return this._dots[label];
};

/**** SHEETS ****/

/**
 * Get all stuntsheets in the Show
 *
 * @return {Array<Sheet>} the list of stuntsheets in the show
 */
Show.prototype.getSheets = function() {
    return this._sheets;
};

/**
 * Add a stuntsheet to the show with the given number of beats
 *
 * @param {int} numBeats -- the number of beats for the stuntsheet
 * @return {Sheet} the newly created stuntsheet
 */
Show.prototype.addSheet = function(numBeats) {
    var index = this._sheets.length;
    var sheet = Sheet.create(this, index, numBeats, this.getDotLabels());
    this._sheets.push(sheet);
    return sheet;
};

/**
 * Remove a stuntsheet from the show
 *
 * @param {Sheet} sheet -- the sheet to remove
 */
Show.prototype.removeSheet = function(sheet) {
    for (var i = 0; i < this._sheets.length; i++) {
        var _sheet = this._sheets[i];
        if (_sheet === sheet) {
            this._sheets.splice(i, 1);
            i--;
        } else {
            _sheet.setIndex(i);
        }
    }
};

/**** SONGS ****/
// TODO

module.exports = Show;
