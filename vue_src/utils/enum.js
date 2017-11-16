/**
 * A function that sets the given values onto the given class,
 * acting like an Enum. Usage:
 *
 * class Color {...}
 * makeEnum(Color, ["red", "blue", "green"])
 * Color.RED // "red"
 * Color.keys // ["RED"]
 * Color.values // ["red"]
 * Color.forEach(color => { console.log(color); }) // prints "red", then "green", then "blue"
 *
 * @param {class} cls
 * @param {Array} values
 */
export default function makeEnum(cls, values) {
    let keys = [];
    for (let val of values) {
        let key = val.toUpperCase().replace(/[\s-]+/g, "_");
        // creates immutable values
        Object.defineProperty(cls, key, {
            value: val,
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
        forEach: {
            value: callback => {
                for (let i = 0; i < values.length; i++) {
                    callback.call(cls, values[i], keys[i]);
                }
            },
        },
    });
}
