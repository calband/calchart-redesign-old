import { capitalize, isNil, isString, has, mapValues } from 'lodash';

/**
 * @param {String} value
 * @return {String} The key to use for the given value.
 */
function toKey(value) {
    return value.toUpperCase().replace(/[\s-]+/g, '_');
}

/**
 * @param {String} value
 * @return {String} The default label to use for the given value.
 */
function toLabel(value) {
    return capitalize(value).replace(/[-_]+/g, ' ');
}

/**
 * A function that makes the given class an Enum with the given values. Usage:
 *
 * class Color {
 *     // any methods as usual
 * }
 * makeEnum(Color, [
 *     { value: 'red', label: 'Red' },
 *     { value: 'blue', label: 'Blue' },
 *     { value: 'green', label: 'Green' },
 * ]);
 *
 * Color.RED === Color.RED
 * Color.fromValue('red') === Color.RED
 * Color.fromValue(Color.RED) === Color.RED
 * Color.RED.value === 'red'
 * Color.RED.label === 'Red'
 * Color.values === [Color.RED, Color.BLUE, Color.GREEN]
 *
 * @param {class} cls
 * @param {Array} instances - The definition for each Enum value, either as:
 *   - {Object} The properties to set on the Enum instance, needs at least the
 *     `value` property.
 *   - {String} The value for the Enum value
 */
export default function makeEnum(cls, instances) {
    let enumValues = [];
    for (let instance of instances) {
        if (isString(instance)) {
            instance = { value: instance };
        } else if (!has(instance, 'value')) {
            throw new Error('Enum needs a `value`.');
        }
        if (!has(instance, 'label')) {
            instance.label = toLabel(instance.value);
        }

        let key = toKey(instance.value);

        // The Enum value; the result of Color.RED
        let enumValue = Object.create(
            cls.prototype,
            mapValues(instance, v => {
                return { value: v };
            })
        );

        // Defining `RED` as a property of `Color`
        Object.defineProperty(cls, key, {
            value: enumValue,
        });
        enumValues.push(enumValue);
    }

    Object.defineProperties(cls, {
        __enum__: {
            value: true,
        },
        values: {
            value: enumValues,
        },
        fromValue: {
            // Convert a value into the corresponding Enum value
            value: function(v) {
                if (isNil(v) || v instanceof cls) {
                    return v;
                } else {
                    let val = this[toKey(v)];
                    if (val) {
                        return val;
                    } else {
                        throw new Error(`Invalid value: ${v}`);
                    }
                }
            },
        },
    });
}

/**
 * @param {Class} cls
 * @return {boolean} true if the given class is an Enum
 */
export function isEnum(cls) {
    return has(cls, '__enum__');
}
