/**
 * @file Defines the Vuex module containing state relating to the editor.
 *
 * The mutations and actions are broken up into submodules in this directory
 * to distinguish between mutations and actions that should be recorded in
 * the History.
 */

import { has, isString } from 'lodash';

import parseAction from 'editor/actions';
import ContextType from 'editor/ContextType';
import ToolType from 'editor/ToolType';
import History from 'utils/History';

import * as editorActions from './actions.js';
import * as historyActions from './history-actions';
import * as historyMutations from './history-mutations';
import * as editorMutations from './mutations.js';

export default {
    namespaced: true,
    $init(store) {
        History.init(store);
    },
    state: {
        // data for creating a new show
        newShowData: null,
        // the currently active context
        context: ContextType.DOT,
        // the currently active Sheet
        sheet: null,
        // the currently active edit tool
        tool: ToolType.SELECTION,
        // the current snap grid
        snap: 2,
    },
    mutations: {
        ...editorMutations,
        ...historyMutations,
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
                    History.addState(name, context.rootState);
                });
            } else if (has(editorMutations, name)) {
                context.commit(name, data);
            } else if (has(historyMutations, name)) {
                context.commit(name, data);
                History.addState(name, context.rootState);
            } else {
                throw new Error(`Invalid action: ${name}`);
            }
        },
        ...editorActions,
        ...historyActions,
    },
};
