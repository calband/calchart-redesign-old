/**
 * @file Defines the Vuex module containing state relating to the editor.
 */

import ContextType from 'editor/ContextType';

export default {
    namespaced: true,
    state: {
        // data for creating a new show
        newShowData: null,
        // the context
        context: ContextType.DOT,
    },
    mutations: {
        /**
         * Set data for creating a new show.
         *
         * @param {Object} data
         */
        setNewShowData(state, data) {
            state.newShowData = data;
        },
    },
    actions: {
        /**
         * Save the current show to the server.
         *
         * @param {Object} options - Options to pass to AJAX.
         */
        saveShow(context, options) {
            sendAction('save_show', {
                showData: context.rootState.show.serialize(),
            }, options);
        },
    },
};
