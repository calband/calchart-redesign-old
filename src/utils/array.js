/**
 * @file Utility functions on Arrays.
 */
import { findIndex, isEqual, uniqWith } from 'lodash';

/**
 * Find an element in the given array and remove it from the array.
 *
 * Any arguments passed are passed to `_.findIndex`. This function is useful
 * for Vue data Arrays that can't use `_.pullAt`.
 *
 * @param {Array} array
 * @param {...A} args - Additional arguments to pass to `_.findIndex`
 */
export function findAndRemove(array) {
    let index = findIndex.apply(null, arguments);
    array.splice(index, 1);
}

/**
 * Return a new duplicate-free array, doing a deep equality to check objects.
 *
 * @param {Array} array
 * @return {Array}
 */
export function unique(array) {
    return uniqWith(array, isEqual);
}
