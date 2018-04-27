/**
 * @file Defines the Vuex module containing state relating to the editor.
 *
 * The mutations and actions are broken up into submodules in this directory
 * to distinguish between mutations and actions that should be recorded in
 * the History.
 */

import { has, isString } from 'lodash';

import ContextType from 'editor/ContextType';
import parseAction from 'utils/actions';
import History from 'utils/History';

import * as editorActions from './actions';
import * as historyActions from './history-actions';
import * as historyMutations from './history-mutations';
import * as editorMutations from './mutations';

let history = null;

/**
 * Get the History currently in use by the editor.
 *
 * @return {History}
 */
export function getHistory() {
    return history;
}

export default {
    namespaced: true,
    $init(store) {
        history = new History(store, store.rootState);
    },
    state: {
        // The currently active context
        context: ContextType.FORMATION,
    },
    mutations: {
        /**
         * @param {ContextType} context
         */
        setContext(state, context) {
            state.context = context;
        },
        // ...editorMutations,
        // ...historyMutations,
    },
    actions: {
        /**
         * Do the given action, which is either a String that contains the
         * action to run or the Object containing the values for the action.
         *
         * @param {String|Object} action - See parseAction for format.
         */
        doAction(context, action) {
            if (isString(action)) {
                action = parseAction(action);
            }
            let { name, data } = action;

            if (has(editorActions, name)) {
                context.dispatch(name, data);
            } else if (has(historyActions, name)) {
                context.dispatch(name, data).then(() => {
                    history.addState(name, context.rootState);
                });
            } else if (has(editorMutations, name)) {
                context.commit(name, data);
            } else if (has(historyMutations, name)) {
                context.commit(name, data);
                history.addState(name, context.rootState);
            } else {
                throw new Error(`Invalid action: ${name}`);
            }
        },
        /**
         * Redo an action.
         */
        redo() {
            history.redo();
        },
        /**
         * Undo an action.
         */
        undo() {
            history.undo();
        },
        ...editorActions,
        // ...historyActions,
    },
};
