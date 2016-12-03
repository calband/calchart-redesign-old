var AnimationState = require("./AnimationState");

/**
 * A Dot object contains all the data for a marcher in a Show, containing the
 * following information:
 *  - the dot label
 *  - the information for marching the current Sheet (see Sheet.getInfoForDot)
 *
 * @param {string} label -- the label for the dot
 */
var Dot = function(label) {
    this._label = label;

    this._sheetInfo = null;
};

/**
 * Create a Dot from the given serialized data
 *
 * @param {object} data -- the JSON data to initialize the Dot with
 * @return {Dot} the Dot reconstructed from the given data
 */
Dot.deserialize = function(data) {
    return new Dot(data.label);
};

/**
 * Return the JSONified version of the Dot
 *
 * @return {object} a JSON object containing this Dot's data
 */
Dot.prototype.serialize = function() {
    return {
        label: this._label,
    };
};

/**
 * Get the label for this dot
 *
 * @return {string} the label for the dot
 */
Dot.prototype.getLabel = function() {
    return this._label;
};

/**** ANIMATION ****/

/**
 * Load the given Sheet to the Dot. This simulates a marcher "remembering"
 * the next stuntsheet in the show. Extracts the Dot's movements from
 * the stuntsheet and stores all necessary movements for the Dot to know
 * how to move in the stuntsheet.
 *
 * @param {Sheet} sheet -- the stuntsheet to load
 */
Dot.prototype.loadSheet = function(sheet) {
    this._sheetInfo = sheet.getInfoForDot(this._label);
};

/**
 * Returns an AnimationState object that describes the Dot's position,
 * orientation, etc. for the currently loaded stuntsheet.
 *
 * @param {int} beatNum -- the beat of the current stuntsheet
 * @return {AnimationState|null} An AnimationState that describes the Dot at
 *   a moment of the show. If the Dot has no movement at the specified beat,
 *   returns null.
 */
Dot.prototype.getAnimationState = function(beatNum) {
    var movements = this._sheetInfo.movements;
    for (var i = 0; i < movements.length; i++) {
        var movements = movements[i];
        beatNum -= movement.getBeatDuration();
        if (beatNum < 0) {
            return movement.getAnimationState(beatNum);
        }
    }

    // if it's the zeroth beat, just return the start position
    if (beatNum === 0) {
        return new AnimationState(this._sheetInfo.position, 0);
    } else {
        return null;
    }
};

/**
 * Return the dot's dot type for the currently loaded stuntsheet
 *
 * @param {string} the dot type for the current stuntsheet
 */
Dot.prototype.getDotType = function() {
    return this._sheetInfo.type;
};

module.exports = Dot;
