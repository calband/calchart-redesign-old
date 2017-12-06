/**
 * @file Utility functions on Arrays.
 */
import _ from 'lodash';

/**
 * Find the element in the given array using the given
 * arguments and remove from the array. Useful for Vue
 * data Arrays that can't use `_.pullAt`.
 *
 * See `_.findIndex` for usage.
 */
export function findAndRemove(array) {
    let index = _.findIndex.apply(null, arguments);
    array.splice(index, 1);
}
