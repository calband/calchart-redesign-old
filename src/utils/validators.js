/**
 * @file A collection of functions that validate data or types.
 */

import {
    every,
    filter,
    has,
    isArray,
} from 'lodash';

/**
 * Validate a list whose elements satisfy the provided validator.
 *
 * @param {function(A): boolean} validator
 * @return {function(A[]): boolean}
 */
export function validateList(validator) {
    return arr => every(arr, validator);
}

/**
 * Validate that an object contains at least the given keys.
 *
 * @param {string[]} ...keys
 * @return {function(Object): boolean}
 */
export function validateObject(...keys) {
    if (isArray(keys[0])) {
        keys = keys[0];
    }
    return obj => filter(keys, k => !has(obj, k)).length === 0;
}

/**
 * Return a validator for a string that must be one in an Enum.
 *
 * @param {Enum} cls
 * @return {function(string): boolean}
 */
export function validateInEnum(cls) {
    return s => {
        try {
            cls.fromValue(s);
            return true;
        } catch (e) {
            return false;
        }
    };
}
