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
 * @param {object|null} show_data -- the JSON data to initialize the Show
 *   with, or null if it's a new Show.
 */
var Show = function(show_data) {
    if (show_data === null) {
        this._dots = {};
        this._sheets = [];
        this._songs = [];
    } else {
        this._dots = {};
        show_data.dots.forEach(function(dot_data) {
            var dot = Dot.deserialize(dot_data);
            dots[dot.label] = dot;
        });
        this._sheets = show_data.sheets.map(function(sheet_data) {
            return Sheet.deserialize(sheet_data);
        });
        this._songs = show_data.songs.map(function(song_data) {
            return Song.deserialize(song_data);
        });
    }
};

/**
 * Return the JSONified version of the Show
 *
 * @return {string} a JSON string containing this Show's data
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

    return JSON.stringify(data);
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
