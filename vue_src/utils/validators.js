/**
 * @file A collection of functions that validate data or types.
 */

import {
    difference,
    every,
    includes,
    isArray,
    keys as _keys,
    partial,
} from 'lodash';

/**
 * Return a validator for a list whose elements satisfy the provided
 * validator.
 *
 * @param {function(Any): boolean} validator
 * @return {function(Array): boolean}
 */
export function validateList(validator) {
    return arr => every(arr, validator);
}

/**
 * Return a function that checks that its argument is an object containing
 * at least the given keys.
 *
 * @param {string[]} ...keys
 * @return {function(Object): boolean}
 */
export function validateObject(...keys) {
    if (isArray(keys[0])) {
        keys = keys[0];
    }
    return obj => difference(keys, _keys(obj)).length === 0;
}

/**
 * Return a validator for a string that must be one of the provided values.
 *
 * @param {string[]} ...vals
 * @return {function(String): boolean}
 */
export function validateOneOf(...vals) {
    if (isArray(vals[0])) {
        vals = vals[0];
    }
    return partial(includes, vals);
}
