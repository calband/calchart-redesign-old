/**
 * A Dot object contains all the data for a marcher, containing the
 * following information:
 *  - the dot label
 *
 * @param {string} label -- the label for the dot
 */
var Dot = function(label) {
    this.label = label;
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
 * @return {string} a JSON string containing this Dot's data
 */
Dot.prototype.serialize = function() {
    var data = {};
    data.label = this.label;
    return JSON.stringify(data);
};

module.exports = Dot;
