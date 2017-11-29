/**
 * @file Defines the Vuex module containing state relating to the editor.
 */

import ContextType from 'editor/ContextType';
import ToolType from 'editor/ToolType';

export default {
    namespaced: true,
    state: {
        // data for creating a new show
        newShowData: null,
        // the currently active context
        context: ContextType.DOT,
        // the currently active edit tool
        tool: ToolType.SELECTION,
        // the current snap grid
        snap: 2,
    },
    mutations: {
        /**
         * @param {Object} data
         */
        setNewShowData(state, data) {
            state.newShowData = data;
        },
        /**
         * @param {String} snap
         */
        setSnap(state, snap) {
            state.snap = parseInt(snap);
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
