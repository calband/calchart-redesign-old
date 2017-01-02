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
    ChildClass.prototype.constructor = ChildClass;
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
 * Parse the arguments passed to a function as either positional arguments
 * or as keyword arguments, passed as an object.
 *
 * @param {Array} args -- the arguments passed to the original function, with
 *   either an object passed as the only argument (to be used as all the
 *   arguments), or the arguments in order as defined by labels.
 * @param {Array<string>} labels -- the names of each argument, in order
 * @return {object} the arguments passed in, with the keys specified by
 *   labels and the values either undefined or the parsed argument
 */
JSUtils.parseArgs = function(args, labels) {
    if (args.length === 1 && args[0] !== null) {
        var _checkArg = function(arg) {
            for (var key in arg) {
                if (labels.indexOf(key) === -1) {
                    return;
                }
            }
            return arg;
        };
        var kwargs = _checkArg(args[0]);
        if (kwargs !== undefined) {
            return kwargs;
        }
    }

    var _args = {};
    $.each(labels, function(i, label) {
        _args[label] = args[i];
    });
    return _args;
};

/**
 * Generate an array containing numbers within a certain range. Like
 * Python's range() function, can take in one to three parameters.
 *
 * @param {float} start -- if one parameter, the end of the range (exclusive).
 *   Otherwise, the start of the range (inclusive)
 * @param {float} end -- the end of the range (exclusive)
 * @param {float|undefined} interval -- the interval between each number
 *   (defaults to 1)
 * @return {Array<float>} a list of numbers in the range [start, end)
 *   incrementing according to interval
 */
JSUtils.range = function() {
    if (arguments.length === 1) {
        var start = 0;
        var end = arguments[0];
    } else {
        var start = arguments[0];
        var end = arguments[1];
    }

    var arr = [];
    var inc = arguments[2] || 1;
    for (var i = start; i < end; i += inc) {
        arr.push(i);
    }
    return arr;
};

/**
 * Slugifies the given value
 *
 * @param {string} value -- the value to slugify
 * @return {string} the slugified value
 */
JSUtils.slugify = function(value) {
    return value.toLowerCase().replace(/ /g, "_");
};

/**
 * Validate that the given input is a positive value, setting the input
 * to 0 if negative
 *
 * @param {jQuery} input -- the input to validate
 * @return {int} the value of the input
 */
JSUtils.validatePositive = function(input) {
    var value = parseInt($(input).val());
    if (value < 0) {
        $(input).val(0);
        return 0;
    } else {
        return value;
    }
};

module.exports = JSUtils;
