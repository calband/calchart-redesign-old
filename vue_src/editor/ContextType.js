import makeEnum from 'utils/enum';

/**
 * An Enum containing all the possible editor contexts.
 */
export default class ContextType {
    /**
     * Check if the given context type is a subtype of the base type.
     *
     * @param {ContextType} base
     * @param {ContextType} type
     * @return {Boolean}
     */
    static equals(base, type) {
        if (base === ContextType.GRAPH && type !== ContextType.MUSIC) {
            return true;
        } else {
            return base === type;
        }
    }
}

makeEnum(ContextType, [
    'dot',
    'continuity',
    'graph',
    'music',
]);
