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
    return obj => filter(keys, k => !has(obj, k)).length === 0;
}

/**
 * Return a validator for a string that must be one in an Enum.
 *
 * @param {Enum} cls
 * @return {function(String): boolean}
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
