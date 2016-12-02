/**
 * A collection of Javascript utility/helper functions.
 */
var JSUtils = {};

/**
 * Empties an array. Source: http://stackoverflow.com/a/1232046/4966649
 *
 * @param {Array} array -- array to be emptied
 */
JSUtils.empty = function(array) {
    array.splice(0, array.length);
};
 
/**
 * Causes a child class to inherit from a parent class.
 *
 * @param {function} ChildClass The class that will inherit
 *   from another.
 * @param {function} ParentClass The class to inherit from.
 */
JSUtils.extends = function(ChildClass, ParentClass) {
    var Inheritor = function() {}; // dummy constructor
    Inheritor.prototype = ParentClass.prototype;
    ChildClass.prototype = new Inheritor();
};

/**
 * Convert the given string from camel case into a capitalized string.
 * Ex. "someFunc" -> "Some Func".
 * Source: http://stackoverflow.com/a/4149393/4966649
 *
 * @param {string} s -- the string to convert
 * @return {string} the given string capitalized and split by caps
 */
JSUtils.fromCamelCase = function(s) {
    return s.replace(/([A-Z])/g, " $1").replace(/^./, function(first) {
        return first.toUpperCase();
    });
};

/**
 * Generate an array that starts at the given start and increments
 * by the given interval until the end.
 *
 * @param {float} start -- the start of the range (inclusive)
 * @param {float} end -- the end of the range (exclusive)
 * @param {float|undefined} interval -- the interval between each number
 *   (defaults to 1)
 * @return {Array<float>} a list of numbers in the range [start, end)
 *   incrementing according to interval
 */
JSUtils.range = function(start, end, interval) {
    var arr = [];
    var inc = interval || 1;
    for (var i = start; i < end; i += inc) {
        arr.push(i);
    }
    return arr;
};

module.exports = JSUtils;
