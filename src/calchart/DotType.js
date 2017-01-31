import * as _ from "lodash";

import makeEnum from "utils/Enum";

/**
 * An Enum containing all the possible dot types.
 */
export default class DotType {
    /**
     * Sort the given dot types according to the order specified
     * in the object.
     *
     * @param {Iterable.<string>} dotTypes - The dot types to sort.
     * @return {string[]} The sorted dot types
     */
    static sort(dotTypes) {
        let types = new Set(dotTypes);
        return _.compact(this.values.map(function(dotType) {
            if (types.has(dotType)) {
                return dotType;
            }
        }));
    }
}

makeEnum(DotType, [
    "plain",
    "solid",
    "plain-forwardslash",
    "solid-forwardslash",
    "plain-backslash",
    "solid-backslash",
    "plain-x",
    "solid-x",
]);
