var Dot = require("./Dot");
var Sheet = require("./Sheet");
var Song = require("./Song");

/**
 * A Show object contains all the data for a Calchart show, containing
 * the following information:
 *  - a Dot object for each dot in the show
 *  - a Sheet object for each stuntsheet in the show
 *  - a Song object for each song in the show
 *
 * @param {object} show_data -- the JSON data to initialize the Show with
 */
var Show = function(show_data) {
    this._dots = {};
    show_data.dots.forEach(function(dot_data) {
        var dot = Dot.deserialize(dot_data);
        this._dots[dot.label] = dot;
    }, this);

    this._sheets = show_data.sheets.map(function(sheet_data) {
        return Sheet.deserialize(sheet_data);
    });
    this._songs = show_data.songs.map(function(song_data) {
        return Song.deserialize(song_data);
    });
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
    });
};

/**
 * Return the JSONified version of the Show
 *
 * @return {object} a JSON object containing this Show's data
 */
Show.prototype.serialize = function() {
    var data = {};

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

/**
 * Get all dot labels
 *
 * @return {Array<string>} labels of all dots in show
 */
Show.prototype.getDotLabels = function(label) {
    return Object.keys(this._dots);
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

/**
 * Add a stuntsheet to the show with the given number of beats
 *
 * @param {int} numBeats -- the number of beats for the stuntsheet
 * @return {Sheet} the newly created stuntsheet
 */
Show.prototype.addSheet = function(numBeats) {
    var sheet = Sheet.create(numBeats, this.getDotLabels());
    this._sheets.push(sheet);
    return sheet;
};

/**
 * Get all stuntsheets in the Show
 *
 * @return {Array<Sheet>} the list of stuntsheets in the show
 */
Show.prototype.getSheets = function() {
    return this._sheets;
};

module.exports = Show;
