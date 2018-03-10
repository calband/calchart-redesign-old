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

    /**
     * Check if the given context type is the current context.
     *
     * @param {Store} store
     * @param {(String|ContextType)} context
     * @return {Boolean}
     */
    static isCurrent(store, context) {
        return this.equals(this.fromValue(context), store.state.editor.context);
    }
}

makeEnum(ContextType, [
    'graph',
    'dot',
    'continuity',
    'music',
    'background',
    'ftl-path',
    'gate-reference',
]);
