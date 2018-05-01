/**
 * @file Actions that are saved in History.
 */

/**
 * Modify the Show with the given arguments.
 *
 * Takes in an object in the Show to be updated (defaults to the
 * Show itself). This target should have been freshly retrieved from
 * the Show in the store, since `modifyShow` is supposed to actually
 * change the state, but this is not checked.
 *
 * @param {Object}
 *  | {Any} [target=context.state.show]
 *  | {string} func - The function to call on the target.
 *  | {Array} args - Arguments to pass to the function.
 */
export function modifyShow(context, { target, func, args }) {
    target = target || context.rootState.show;
    target[func].apply(target, args);
}
