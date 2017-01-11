/**
 * A function that sets the given values onto the given class,
 * acting like an Enum. Usage:
 *
 * class Color {...}
 * makeEnum(Color, ["red", "blue", "green"])
 * Color.RED // "red"
 * Color.RED = "blue" // does nothing
 * for (let color in Color) { console.log(color); } // "RED"
 * for (let color of Color) { console.log(color); } // "red"
 * Color.keys // ["RED"]
 * Color.values // ["red"]
 *
 * @param {Function} cls
 * @param {Array} values
 */
export default function makeEnum(cls, values) {
    let keys = [];
    for (let val of values) {
        let key = val.toUpperCase().replace(/[\s-]+/g, "_");
        Object.defineProperty(cls, key, {
            value: val,
            enumerable: true,
        });
        keys.push(key);
    }

    Object.defineProperties(cls, {
        keys: {
            value: keys,
        },
        values: {
            value: values,
        },
    });

    cls[Symbol.iterator] = function() {
        var index = 0;
        return {
            next: function() {
                var i = index;
                index++;
                return {
                    value: values[i],
                    done: i === values.length,
                };
            },
        };
    };
}
