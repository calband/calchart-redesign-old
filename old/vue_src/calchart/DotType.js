import { filter, has, includes } from 'lodash';

import makeEnum from 'utils/enum';

/**
 * An Enum containing all the possible dot types.
 */
export default class DotType {
    /**
     * Sort the given dot types according to the order specified
     * in the object.
     *
     * @param {Iterable.<DotType>} dotTypes - The dot types to sort.
     * @return {DotType[]} The sorted dot types
     */
    static sort(dotTypes) {
        let types = new Set(dotTypes);
        return filter(this.values, dotType => has(types, dotType));
    }

    /**
     * Check whether the given dot type is an ALL dot type.
     *
     * @param {DotType} dotType
     * @return {boolean}
     */
    static isAll(dotType) {
        return includes([DotType.ALL_BEFORE, DotType.ALL_AFTER], dotType);
    }

    /**
     * Check whether the given dot type is a plain dot type.
     *
     * @param {DotType} dotType
     * @return {boolean}
     */
    static isPlain(dotType) {
        return dotType.value.startsWith('plain');
    }

    /**
     * Get the slashes required to draw this dot type.
     *
     * @param {DotType} dotType
     * @return {Object}
     *   - {boolean} forward
     *   - {boolean} back
     */
    static getSlashes(dotType) {
        let suffix = dotType.value.split('-')[1];
        return {
            forward: suffix === 'forwardslash' || suffix === 'x',
            back: suffix === 'backslash' || suffix === 'x',
        };
    }
}

makeEnum(DotType, [
    'all-before', // TODO: separate into another enum
    'plain',
    'solid',
    'plain-forwardslash',
    'solid-forwardslash',
    'plain-backslash',
    'solid-backslash',
    'plain-x',
    'solid-x',
    'all-after',
]);
