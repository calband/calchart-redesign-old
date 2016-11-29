var Coordinate = require("./Coordinate");
var Continuity = require("./Continuity");

/**
 * A Sheet object contains all the information related to a stuntsheet,
 * consisting of the following information:
 *  - an optional label for the Sheet
 *  - the number of beats in the stuntsheet
 *  - for each dot, its dot type
 *  - for each dot, its position
 *  - for each dot, its movements
 *  - for each dot type, its continuity
 *
 * @param {int} numBeats -- the number of beats in the stuntsheet
 * @param {object|undefined} options -- an optional argument that can
 *   contain optional information about a stuntsheet, such as:
 *     - {string} label -- a label for the Sheet
 */
var Sheet = function(numBeats, options) {
    this.numBeats = numBeats;

    var defaults = {
        label: null,
    };
    options = $.extend(defaults, options);
    this.label = options.label;

    // map dot labels to an object containing the dot's type (string),
    // position (Coordinate), and movements (Array<MovementCommand>)
    this._dots = {};
    // map dot type to Continuity
    this._continuities = {};
};

/**
 * Create a Sheet from the given serialized data
 *
 * @param {object} data -- the JSON data to initialize the Sheet with
 * @return {Sheet} the Sheet reconstructed from the given data
 */
Sheet.deserialize = function(data) {
    var sheet = new Sheet(data.numBeats, data.options);

    sheet._dots = {};
    $.each(data.dots, function(dot, dot_data) {
        sheet._dots[dot] = {
            type: dot_type.type,
            position: Coordinate.deserialize(dot_data.position),
            movements: dot_data.movements.map(function(movement_data) {
                switch (movement_data.type) {
                    // TODO
                }
            }),
        };
    });

    sheet._continuities = {};
    $.each(data.continuities, function(dot_type, continuity_data) {
        sheet._continuities[dot_type] = Continuity.deserialize(continuity_data);
    });
};

/**
 * Return the JSONified version of this Sheet
 *
 * @return {object} a JSON object containing this Sheet's data
 */
Sheet.prototype.serialize = function() {
    var data = {};

    data.options = {
        label: this.label,
    };
    
    data.dots = {};
    $.each(this._dots, function(dot, dot_data) {
        data.dots[dot] = {
            type: dot_data.type,
            position: dot_data.position.serialize(),
            movements: dot_data.movements.map(function(movement) {
                return movement.serialize();
            }),
        };
    });

    data.continuities = {};
    $.each(this._continuities, function(dot_type, continuity) {
        data.continuities[dot_type] = continuity.serialize();
    });

    return data;
};

module.exports = Sheet;
