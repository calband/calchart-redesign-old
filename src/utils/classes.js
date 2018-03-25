/**
 * @file Utility functions related to Javascript classes.
 */

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
