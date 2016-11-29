/**
 * A Coordinate represents a dot's position on the field
 *
 * @param {float} x -- number of steps from the south endzone
 * @param {float} y -- number of steps from the west sideline
 */
var Coordinate = function(x, y) {
    this.x = x;
    this.y = y;
};

/**
 * Create a Coordinate from the given serialized data
 *
 * @param {object} data -- the JSON data to initialize the Coordinate with
 * @return {Coordinate} the Coordinate reconstructed from the given data
 */
Coordinate.deserialize = function(data) {
    return new Coordinate(data.x, data.y);
};

/**
 * Return the JSONified version of this Coordinate
 *
 * @return {object} a JSON object containing this Coordinate's data
 */
Coordinate.prototype.serialize = function() {
    return {
        x: this.x,
        y: this.y,
    };
};

module.exports = Coordinate;
