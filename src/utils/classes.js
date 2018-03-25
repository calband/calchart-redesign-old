/**
 * @file Utility functions related to Javascript classes.
 */

import { mapValues } from 'lodash';

/**
 * Create an instance of the given class with the given values.
 *
 * For example, given class `A` and the values { x: 1, y: i => i * 2 }, this
 * function will create an Object `a` such that:
 *
 * a.x            // 1
 * a.y(3)         // 6
 * a instanceof A // true
 *
 * @param {Class} cls
 * @param {Object} values
 * @return {Object}
 */
export function createInstance(cls, values) {
    return Object.create(
        cls.prototype,
        mapValues(values, v => ({ value: v }))
    );
}

/**
 * Check if the given class is a subclass of the other.
 *
 * Excludes the case of child === parent.
 *
 * @param {Class} child
 * @param {Class} parent
 * @return {boolean}
 */
export function isSubClass(child, parent) {
    return child.prototype instanceof parent;
}
