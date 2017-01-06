var AnimationState = require("./AnimationState");

/**
 * A Dot object contains all the data for a marcher in a Show, containing the
 * following information:
 *  - the dot label
 *
 * @param {string} label -- the label for the dot
 */
var Dot = function(label) {
    this._label = label;
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

module.exports = Dot;
