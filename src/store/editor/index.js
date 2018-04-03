/**
 * @file Defines the Vuex module containing state relating to the editor.
 *
 * The mutations and actions are broken up into submodules in this directory
 * to distinguish between mutations and actions that should be recorded in
 * the History.
 */

// import History from 'utils/History';

// import * as editorActions from './actions.js';
// import * as historyActions from './history-actions';
// import * as historyMutations from './history-mutations';
import * as editorMutations from './mutations.js';

export default {
    namespaced: true,
    $init(store) {
        // History.init(store);
    },
    state: {
        // data for creating a new show
        newShowData: null,
    },
    mutations: {
        ...editorMutations,
    //     ...historyMutations,
    },
    actions: {
        // ...editorActions,
        // ...historyActions,
    },
};
