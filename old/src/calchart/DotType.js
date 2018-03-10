import makeEnum from "utils/Enum";

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
        return _.compact(this.values.map(function(dotType) {
            if (types.has(dotType)) {
                return dotType;
            }
        }));
    }

    /**
     * Check whether the given dot type is an ALL dot type.
     *
     * @param {DotType} dotType
     * @return {boolean}
     */
    static isAll(dotType) {
        return dotType === this.ALL_BEFORE || dotType === this.ALL_AFTER;
    }
}

makeEnum(DotType, [
    "all-before",
    "plain",
    "solid",
    "plain-forwardslash",
    "solid-forwardslash",
    "plain-backslash",
    "solid-backslash",
    "plain-x",
    "solid-x",
    "all-after",
]);
