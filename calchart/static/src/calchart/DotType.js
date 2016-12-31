/**
 * An object containing all the possible dot types
 */
var DotType = {
    PLAIN: "plain",
    SOLID: "solid",
    PLAIN_FSLASH: "plain-forwardslash",
    SOLID_FSLASH: "solid-forwardslash",
    PLAIN_BSLASH: "plain-backslash",
    SOLID_BSLASH: "solid-backslash",
    PLAIN_X: "plain-x",
    SOLID_X: "solid-x",
};

/**
 * Sort the given dot types according to the order specified
 * in the object
 *
 * @param {Iterable<string>} dotTypes -- the dot types to sort
 * @return {Array<string>} the sorted dot types
 */
DotType.sort = function(dotTypes) {
    var types = new Set(dotTypes);
    return $.map(this, function(dotType) {
        if (types.has(dotType)) {
            return dotType;
        }
    });
};

module.exports = DotType;
