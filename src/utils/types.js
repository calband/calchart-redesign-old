/**
 * @file Utility functions related to Javascript types.
 */

import {
    attempt,
    every,
    forEach,
    has,
    isArray,
    isError,
    isNull,
    isPlainObject,
    isString,
    reject,
    some,
} from 'lodash';

/**
 * Check that the given object matches the given type definition.
 *
 * @param {Object} object
 * @param {Object} typeDef
 * @return {boolean}
 */
export function checkType(object, typeDef) {
    return !isError(attempt(checkTypeError, object, typeDef));
}

/**
 * Error if the given object does not match the given type definition.
 *
 * The type definition can be one of the following:
 *  - {null} Checks that `object === null`
 *  - {string} Checks that `typeof object` returns the given string
 *  - {Class} Checks that `object instanceof cls` returns true
 *  - {TYPE[]} Checks that `object` matches any of the given type definitions
 *  - {Object} Contains `_type` and `_wraps` properties of the given options:
 *      - _type: 'array'
 *        _wraps: TYPE (every object in array matches given type definition)
 *      - _type: 'object'
 *        _wraps: Object (object recursively conforms to type definition)
 *      - _type: 'tuple'
 *        _wraps: [TYPE, TYPE, ..] (check length, each element matches its type)
 *      - _type: 'mapping'
 *        _wraps: TYPE (check every value matches given type)
 *  - {Object} If no `_type` property is given, treat it as `_type: 'object'`.
 *
 * @param {Object} object
 * @param {Object} typeDef
 */
export function checkTypeError(object, typeDef) {
    // fail with given message
    function _fail(msg) {
        throw new Error(msg);
    }

    if (isNull(typeDef)) {
        if (!isNull(object)) {
            _fail(`${object} not null`);
        }
    } else if (isString(typeDef)) {
        if (typeof object !== typeDef) {
            _fail(`${object} not of type ${typeDef}`);
        }
    } else if (isArray(typeDef)) {
        if (!some(typeDef, t => checkType(object, t))) {
            _fail(`${object} doesn't match any of ${typeDef}`);
        }
    } else if (isPlainObject(typeDef)) {
        let type = typeDef._wraps;
        switch (typeDef._type) {
            case 'array': {
                if (!isArray(object)) {
                    _fail(`Not an array: ${object}`);
                } else {
                    let nonConforming = reject(object, v => checkType(v, type));
                    if (nonConforming.length > 0) {
                        _fail(`${type} not matched for: ${nonConforming}`);
                    }
                }
                break;
            }
            case 'object': {
                if (!isPlainObject(object)) {
                    _fail(`Not an object: ${object}`);
                } else {
                    forEach(object, (v, k) => {
                        if (!has(type, k)) {
                            _fail(`Unknown key encountered: ${k}`);
                        }
                        checkTypeError(v, type[k]);
                    });
                    forEach(type, (_, k) => {
                        if (!has(object, k)) {
                            _fail(`Missing key: ${k}`);
                        }
                    });
                }
                break;
            }
            case 'tuple': {
                if (!isArray(object)) {
                    _fail(`Not a tuple: ${object}`);
                } else if (object.length !== type.length) {
                    _fail(`Wrong length: ${object} (expected: ${type.length})`);
                } else if (!every(object, (v, i) => checkType(v, type[i]))) {
                    _fail(`${object} does not match ${type}`);
                }
                break;
            }
            case 'mapping': {
                if (!isPlainObject(object)) {
                    _fail(`Not a mapping: ${object}`);
                } else {
                    forEach(object, (v, k) => {
                        checkTypeError(v, type);
                    });
                }
                break;
            }
            case undefined: {
                checkTypeError(object, { _type: 'object', _wraps: typeDef });
                break;
            }
            default: {
                _fail(`Not recognized type: ${typeDef._type}`);
            }
        }
    } else if (!(object instanceof typeDef)) {
        _fail(`${object} not instance of ${typeDef}`);
    }
}

/**
 * Check if the given class is a subclass of the other.
 *
 * @param {Class} child
 * @param {Class} parent
 * @return {boolean}
 */
export function isSubClass(child, parent) {
    return child.prototype instanceof parent || child === parent;
}

/**
 * Validate that a given object has the given type definition.
 *
 * @param {Object} typeDef
 * @return {function(Object): boolean}
 */
export function validateType(typeDef) {
    return object => checkType(object, typeDef);
}
