/**
 * @file A collection of Javascript utility/helper functions.
 */

/**
 * Empty the given array. Source: http://stackoverflow.com/a/1232046/4966649
 *
 * @param {Array} array
 */
export function empty(array) {
    array.splice(0, array.length);
}

/**
 * Convert the given string from camel case into a capitalized string, e.g.
 * "someFunc" -> "Some Func". Source: http://stackoverflow.com/a/4149393/4966649
 *
 * @param {string} str
 * @return {string}
 */
export function fromCamelCase(str) {
    return str.replace(/([A-Z])/g, " $1").replace(/^./, first => first.toUpperCase());
}

/**
 * Get the value from an optional object, returning the given default if
 * the object or value is undefined.
 *
 * @param {Object} obj - The object to retrieve from.
 * @param {string} key - The key of the value to retrieve.
 * @param {} defaultVal - The default value to return.
 * @return {} The value of the object, or the default if undefined.
 */
export function get(obj, key, defaultVal) {
    let val = obj[key];
    return val === undefined ? defaultVal : val;
}

/**
 * @return {boolean} True if the user is on a Mac, false otherwise.
 */
export function isMac() {
    // https://css-tricks.com/snippets/javascript/test-mac-pc-javascript/
    return navigator.userAgent.indexOf("Mac OS X") !== -1;
}

/**
 * Parse the arguments passed to a function as either positional arguments
 * or as keyword arguments, passed as an object.
 *
 * @param {Array} args - The arguments passed to the original function, with
 *   either an object passed as the only argument (to be used as all the
 *   arguments), or the arguments in order as defined by labels.
 * @param {string[]} labels - The names of each argument, in order.
 * @return {Object} The arguments passed in, with the keys specified by
 *   labels and the values either undefined or the parsed argument.
 */
export function parseArgs(args, labels) {
    if (args.length === 1 && args[0] !== null) {
        let kwargs = args[0];
        for (let key in kwargs) {
            if (labels.indexOf(key) === -1) {
                kwargs = null;
                break;
            }
        }
        if (kwargs) {
            return kwargs;
        }
    }

    let kwargs = {};
    $.each(labels, (i, label) => {
        kwargs[label] = args[i];
    });
    return kwargs;
}

/**
 * Generate an array containing numbers within a certain range. Like
 * Python's range() function, can take in one to three parameters.
 *
 * @param {number} start - If one parameter, the end of the range
 *   (exclusive). Otherwise, the start of the range (inclusive).
 * @param {number} [end] - The end of the range (exclusive).
 * @param {number} [interval=1] - The interval between each number.
 * @return {number[]} A list of numbers in the range [start, end),
 *   incrementing according to interval.
 */
export function range(start, end, interval=1) {
    if (end === undefined) {
        end = start;
        start = 0;
    }

    let arr = [];
    for (let i = start; i < end; i += interval) {
        arr.push(i);
    }
    return arr;
}

/**
 * Return the given options, setting undefined keys according to the given
 * defaults
 *
 * @param {Object} options
 * @param {Object} defaults
 * @return {Object}
 */
export function setDefaults(options, defaults) {
    return $.extend({}, defaults, options);
}

/**
 * Convert the given value to camel case
 *
 * @param {string} value
 * @return {string}
 */
export function toCamelCase(value) {
    return value.toLowerCase().replace(/\s*(\w+)/g, str =>
        str[1].toUpperCase() + str.slice(2)
    );
}

/**
 * Validate that the given input is a positive value, setting the input
 * to 0 if negative
 *
 * @param {jQuery} input
 * @return {int}
 */
export function validatePositive(input) {
    var value = parseInt($(input).val());
    if (value < 0) {
        $(input).val(0);
        return 0;
    } else {
        return value;
    }
}
