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
 * Compares this dot with the other dot, according to their labels.
 *
 * @param {Dot} other -- the other dot
 * @return {int} -1 if this dot's label is sorted before the other's dot,
 *   1 if this dot's label is sorted after, or 0 if the labels are the same.
 */
Dot.prototype.compareTo = function(other) {
    var label1 = this._label;
    var label2 = other.getLabel();

    // try to parse out numbers from labels
    var num1 = parseInt(label1);
    var num2 = parseInt(label2);
    if (num1 && num2) {
        label1 = num1;
        label2 = num2;
    }

    return label1 < label2 ? -1 : label1 > label2 ? 1 : 0;
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
 *   a moment of the show. If the Dot has no position at the specified beat,
 *   returns null.
 */
Dot.prototype.getAnimationState = function(beatNum) {
    if (!this._sheetInfo) {
        return;
    }

    var movements = this._sheetInfo.movements;

    var remaining = beatNum;

    for (var i = 0; i < movements.length; i++) {
        var movement = movements[i];
        var duration = movement.getDuration();
        if (remaining <= duration) {
            return movement.getAnimationState(remaining);
        } else {
            remaining -= duration;
        }
    }

    throw new Error("Ran out of movements for " + this._label + ": " + remaining + " beats remaining");
};

/**
 * Return the dot's dot type for the currently loaded stuntsheet
 *
 * @return {string} the dot type for the current stuntsheet
 */
Dot.prototype.getDotType = function() {
    if (this._sheetInfo) {
        return this._sheetInfo.type;
    }
};

/**
 * Get the position of the dot at the beginning of the currently loaded stuntsheet
 *
 * @return {Coordinate} the initial position of the dot
 */
Dot.prototype.getFirstPosition = function() {
    if (this._sheetInfo) {
        return this._sheetInfo.position;
    }
}

/**
 * Get the position of the dot at the end of the currently loaded stuntsheet
 *
 * @return {Coordinate} the final position of the dot
 */
Dot.prototype.getLastPosition = function() {
    if (!this._sheetInfo) {
        return;
    }

    var movements = this._sheetInfo.movements;
    if (movements.length === 0) {
        return this._sheetInfo.position;
    } else {
        return movements[movements.length - 1].getEndPosition();
    }
}

module.exports = Dot;
