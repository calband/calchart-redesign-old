/**
 * @file Utility functions on Arrays.
 */
import { findIndex } from 'lodash';

/**
 * Find the element in the given array using the given
 * arguments and remove from the array. Useful for Vue
 * data Arrays that can't use lodash's `pullAt`.
 *
 * See `findIndex` for usage.
 */
export function findAndRemove(array) {
    let index = findIndex.apply(null, arguments);
    array.splice(index, 1);
}
