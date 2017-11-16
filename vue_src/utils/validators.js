/**
 * @file A collection of functions that validate data or types.
 */

import { difference, every, keys as _keys } from 'lodash';

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
    return obj => difference(keys, _keys(obj)).length === 0;
}
