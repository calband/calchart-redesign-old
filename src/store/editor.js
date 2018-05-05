/**
 * @file Defines the Vuex module containing state relating to the editor.
 *
 * Also keeps a copy of the Show so that the Show in the root store is kept
 * read-only.
 *
 * The mutations and actions are broken up into submodules in this directory
 * to distinguish between mutations and actions that should be recorded in
 * the History.
 */

import { clone, defaultTo, each } from 'lodash';

import Show from 'calchart/Show';
import ContextType from 'editor/ContextType';
import EditDotTool from 'editor/tools/EditDotTool';
import sendAction from 'utils/ajax';
import History from 'utils/History';

let history = null;

/**
 * Get the History currently in use by the editor.
 *
 * @return {History}
 */
export function getHistory() {
    return history;
}

const initialState = {
    // {Show} The show being edited
    show: null,
    // {ContextType} The currently active context
    context: ContextType.FORMATION,
    // {?String} The ID of the currently active formation
    formationId: null,
    // {EditTool} The currently active edit tool
    tool: EditDotTool,
};

export default {
    namespaced: true,
    state: clone(initialState),
    mutations: {
        /**
         * Modify the Show with the given arguments.
         *
         * Takes in an object in the Show to be updated. The target should have
         * been freshly retrieved from the store and be part of the Show in the
         * store. In other words, modifying the target in place should modify
         * the Show in the store, but this is not checked.
         *
         * @param {Object}
         *  | {Any} [target=show]
         *  | {string} func
         *  | {Array} args
         */
        modifyShow(state, { target, func, args }) {
            target = target || state.show;
            target[func].apply(target, args);
            history.addState(func, state);
        },
        /**
         * Set the state from the given object.
         *
         * @param {Object} newState
         */
        setState(state, newState) {
            each(newState, (val, key) => {
                state[key] = val;
            });
        },
    },
    actions: {
        /**
         * Redo an action.
         */
        redo(context) {
            let state = history.redo();
            context.commit('setState', state);
        },
        /**
         * Reset the state for the editor.
         */
        reset(context) {
            let state = clone(initialState);

            state.show = context.rootState.show;
            if (state.show.formations.length > 0) {
                state.formationId = state.show.formations[0].id;
            }
            context.commit('setState', state);

            history = new History(state);
        },
        /**
         * Save the current show to the server.
         *
         * @param {Object} options - Options to pass to AJAX.
         */
        saveShow(context, options) {
            context.dispatch('messages/showMessage', 'Saving...', {
                root: true,
            });

            options = options || {};
            let oldSuccess = defaultTo(options.success, () => {});
            options.success = () => {
                oldSuccess();
                context.dispatch('messages/showMessage', 'Saved!', {
                    root: true,
                });
            };

            let data = context.rootState.show.serialize();
            sendAction('save_show', data, options);
        },
        /**
         * Undo an action.
         */
        undo(context) {
            let state = history.undo();
            context.commit('setState', state);
        },
    },
};
