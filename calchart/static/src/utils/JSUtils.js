/**
 * A collection of Javascript utility/helper functions.
 */
export default class JSUtils {
    /**
     * Empty the given array. Source: http://stackoverflow.com/a/1232046/4966649
     *
     * @param {Array} array
     */
    static empty(array) {
        array.splice(0, array.length);
    }

    /**
     * Convert the given string from camel case into a capitalized string, e.g.
     * "someFunc" -> "Some Func". Source: http://stackoverflow.com/a/4149393/4966649
     *
     * @param {string} str
     * @return {string}
     */
    static fromCamelCase(str) {
        return str.replace(/([A-Z])/g, " $1").replace(/^./, function(first) {
            return first.toUpperCase();
        });
    };

    /**
     * Get the value from an optional object, returning the given default if
     * the object or value is undefined.
     *
     * @param {Object} obj -- the object to retrieve from
     * @param {string} key -- the key of the value to retrieve
     * @param {} defaultVal -- the default value to return
     * @return {} the value of the object, or the default if undefined
     */
    static get(obj, key, defaultVal) {
        let val = obj[key];
        return val === undefined ? defaultVal : val;
    };

    /**
     * @return {boolean} True if the user is on a Mac, false otherwise.
     */
    static isMac() {
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
     * @param {string[]} labels - The names of each argument, in order
     * @return {Object} The arguments passed in, with the keys specified by
     *   labels and the values either undefined or the parsed argument
     */
    static parseArgs(args, labels) {
        if (args.length === 1 && args[0] !== null) {
            let kwargs = args[0];
            for (var key in kwargs) {
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
        $.each(labels, function(i, label) {
            kwargs[label] = args[i];
        });
        return kwargs;
    };
}

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
 * Return the given options, setting undefined keys according to the given
 * defaults
 *
 * @param {object|undefined} options -- the options to return
 * @param {object} defaults -- the defaults to set
 * @return {object} the given defaults, overridden with the given options
 */
JSUtils.setDefaults = function(options, defaults) {
    return $.extend({}, defaults, options);
};

/**
 * Convert the given value to camel case
 *
 * @param {string} value -- the value to convert
 * @return {string} the value as camel case
 */
JSUtils.toCamelCase = function(value) {
    return value.toLowerCase().replace(/ (\w+)/g, function(str) {
        return str[1].toUpperCase() + str.slice(2);
    });
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
