/**
 * @file A collection of functions that validate data or types.
 */

import _ from "lodash";

/**
 * Return a validator for a list whose elements satisfy the provided
 * validator.
 *
 * @param {function(Any): boolean} validator
 * @return {function(Array): boolean}
 */
export function validateList(validator) {
    return arr => _.every(arr, validator);
}

/**
 * Return a function that checks that its argument is an object containing
 * at least the given keys.
 *
 * @param {string[]} ...keys
 * @return {function(Object): boolean}
 */
export function validateObject(...keys) {
    return obj => _.difference(keys, _.keys(obj)).length === 0;
}
