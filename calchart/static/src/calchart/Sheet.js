/**
 * @fileOverview This file defines the Sheet class, which contains information
 * for a stuntsheet in a show. Functions in this file are organized alphabetically
 * in the following sections:
 *
 * - Constructors (including serialization functions)
 * - Instance methods
 */

var Coordinate = require("./Coordinate");
var Continuity = require("./Continuity");
var Dot = require("./Dot");
var DotType = require("./DotType");
var MovementCommand = require("./MovementCommand");
var UIUtils = require("utils/UIUtils");

/**** CONSTRUCTORS ****/

/**
 * A Sheet object contains all the information related to a stuntsheet,
 * consisting of the following information:
 *  - the Show this sheet is a part of
 *  - the index of the Sheet in the Show
 *  - an optional label for the Sheet
 *  - the number of beats in the stuntsheet
 *  - for each dot, its dot type
 *  - for each dot, its position
 *  - for each dot, its movements
 *  - for each dot type, its continuity
 *
 * @param {Show} show -- the Show this sheet is part of
 * @param {int} index -- the index of this Sheet in the Show
 * @param {int} numBeats -- the number of beats in the stuntsheet
 * @param {object|undefined} options -- an optional argument that can
 *   contain optional information about a stuntsheet, such as:
 *     - {string} label -- a label for the Sheet
 *     - {string} fieldType -- the field type
 */
var Sheet = function(show, index, numBeats, options) {
    this._show = show;
    this._index = index;
    this._numBeats = numBeats;

    var defaults = {
        label: null,
        fieldType: null,
    };
    options = $.extend(defaults, options);
    this._label = options.label;
    this._fieldType = options.fieldType;

    // map dot labels to their info for the sheet. See Sheet.getInfoForDot
    this._dots = {};
    // map dot type to Continuities
    this._continuities = {};
};

/**
 * Create a stuntsheet from the given number of beats and the given
 * dot labels.
 *
 * @param {Show} show -- the Show this sheet is a part of
 * @param {int} index -- the index of this Sheet in the Show
 * @param {int} numBeats -- the number of beats in the stuntsheet
 * @param {Array<string>} dotLabels -- the labels for the dots in the show
 * @return {Sheet} the newly created Sheet
 */
Sheet.create = function(show, index, numBeats, dotLabels) {
    var sheet = new Sheet(show, index, numBeats);

    // initialize dots as plain dots
    dotLabels.forEach(function(dot) {
        sheet._dots[dot] = {
            type: DotType.PLAIN,
            position: new Coordinate(0, 0),
            movements: [],
        };
    });

    sheet._continuities[DotType.PLAIN] = [];

    return sheet;
};

/**
 * Create a Sheet from the given serialized data
 *
 * @param {Show} show -- the Show this sheet is a part of
 * @param {object} data -- the JSON data to initialize the Sheet with
 * @return {Sheet} the Sheet reconstructed from the given data
 */
Sheet.deserialize = function(show, data) {
    var sheet = new Sheet(show, data.index, data.numBeats, data.options);

    $.each(data.dots, function(dot, dot_data) {
        sheet._dots[dot] = {
            type: dot_data.type,
            position: Coordinate.deserialize(dot_data.position),
            movements: dot_data.movements.map(function(movement_data) {
                return MovementCommand.deserialize(movement_data);
            }),
        };
    });

    $.each(data.continuities, function(dot_type, continuities_data) {
        sheet._continuities[dot_type] = $.map(continuities_data, function(data) {
            return Continuity.deserialize(sheet, data);
        });
    });

    return sheet;
};

/**
 * Return the JSONified version of this Sheet
 *
 * @return {object} a JSON object containing this Sheet's data
 */
Sheet.prototype.serialize = function() {
    var data = {
        numBeats: this._numBeats,
        index: this._index,
    };

    data.options = {
        label: this._label,
        fieldType: this._fieldType,
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
    $.each(this._continuities, function(dot_type, continuities) {
        data.continuities[dot_type] = $.map(continuities, function(continuity) {
            return continuity.serialize();
        });
    });

    return data;
};

/**** INSTANCE METHODS ****/

/**
 * Add the given continuity to the given dot type
 *
 * @param {string} dotType -- the dot type to add the continuity to
 * @param {BaseContinuity} continuity -- the continuity to add
 */
Sheet.prototype.addContinuity = function(dotType, continuity) {
    this._continuities[dotType].push(continuity);
    this.updateMovements(dotType);
};

/**
 * Get the continuities for the given dot type
 *
 * @param {string} dotType -- the dot type to get continuities for
 * @return {Array<Continuity>} the list of continuities
 */
Sheet.prototype.getContinuities = function(dotType) {
    return this._continuities[dotType];
};

/**
 * Get all dots of the given dot type
 *
 * @param {string} dotType -- the dot type to get dots for
 * @return {Array<Dot>} all dots of the given type
 */
Sheet.prototype.getDotType = function(dotType) {
    var dots = this._show.getDotMapping();
    var dotTypeDots = [];

    $.each(this._dots, function(label, info) {
        if (info.type === dotType) {
            dotTypeDots.push(dots[label]);
        }
    });

    return dotTypeDots;
};

/**
 * Get the dot types in this sheet, in the order listed
 * in DotType
 */
Sheet.prototype.getDotTypes = function() {
    var continuities = this._continuities;
    return $.map(DotType, function(dotType) {
        if (continuities[dotType] !== undefined) {
            return dotType;
        }
    });
};

/**
 * Get the duration of this stuntsheet
 *
 * @return {int} the number of beats in the stuntsheet
 */
Sheet.prototype.getDuration = function() {
    return this._numBeats;
};

/**
 * Get the field type for this stuntsheet, defaulting to the Show's field type
 *
 * @return {string} the field type for the stuntsheet
 */
Sheet.prototype.getFieldType = function() {
    return this._fieldType || this._show.getFieldType();
};

/**
 * Get the info for the given Dot for this stuntsheet
 *
 * @param {string|Dot} dot -- the dot to retrieve info for
 * @return {object} the dot's information for this stuntsheet, containing:
 *   - {DotType} type: the dot's type
 *   - {Coordinate} position: the dot's starting position
 *   - {Array<MovementCommand>} movements: the dot's movements in the sheet
 */
Sheet.prototype.getInfoForDot = function(dot) {
    if (dot instanceof Dot) {
        dot = dot.getLabel();
    }
    return this._dots[dot];
};

/**
 * Get the label for this Sheet, either the custom label or the sheet
 * number in the given Show.
 */
Sheet.prototype.getLabel = function() {
    if (this._label) {
        return this._label;
    }

    return this._index + 1;
};

/**
 * Get the sheet that follows this sheet
 *
 * @return {Sheet|undefined} the sheet after this sheet in the
 *   show, or undefined if this is the last sheet
 */
Sheet.prototype.getNextSheet = function() {
    return this._show.getSheets()[this._index + 1];
};

/**
 * Get the sheet that precedes this sheet
 *
 * @return {Sheet|undefined} the sheet before this sheet in the
 *   show, or undefined if this is the first sheet
 */
Sheet.prototype.getPrevSheet = function() {
    return this._show.getSheets()[this._index - 1];
};

/**
 * @return {boolean} true if this Sheet is the last sheet in the Show
 */
Sheet.prototype.isLastSheet = function() {
    return this._index === this._show.getSheets().length - 1;
}

/**
 * Remove the given continuity to the given dot type
 *
 * @param {string} dotType -- the dot type to remove the continuity from
 * @param {BaseContinuity} continuity -- the continuity to remove
 */
Sheet.prototype.removeContinuity = function(dotType, continuity) {
    var continuities = this._continuities[dotType];
    var index = continuities.indexOf(continuity);
    continuities.splice(index, 1);
    this.updateMovements(dotType);
};

/**
 * Update the movements for the given dots
 *
 * @param {string|Dot|Array<Dot>} dots -- the dots to update movements for, as either
 *   the dot type, the Dot, or a list of Dots.
 */
Sheet.prototype.updateMovements = function(dots) {
    if (typeof dots === "string") {
        dots = this.getDotType(dots);
    } else if (dots instanceof Dot) {
        dots = [dots];
    }

    var _this = this;
    var duration = this._numBeats;

    dots.forEach(function(dot) {
        var continuities = _this._continuities[dot.getDotType()];
        var info = this._dots[dot.getLabel()];
        var position = info.position;
        var movements = [];
        continuities.forEach(function(continuity, i, arr) {
            var moves = continuity.getMovements(this, dot, position);
            movements = movements.concat(moves);
            position = movements[movements.length - 1].getEndPosition();
        }, this);
        info.movements = movements;
    }, this);
};

/**
 * Update the position of the corresponding Dot for the given dot
 *
 * @param {jQuery} dot -- the HTML representation of the dot
 */
Sheet.prototype.updatePosition = function(dot, x, y) {
    var label = $(dot).data("dot").getLabel();
    var coordinate = this._dots[label].position;
    coordinate.x = x;
    coordinate.y = y;
};

module.exports = Sheet;
