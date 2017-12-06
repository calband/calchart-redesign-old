/**
 * @file Defines the Vuex module containing state relating to the editor.
 */

import { has } from 'lodash';

import parseAction from 'editor/actions';
import ContextType from 'editor/ContextType';
import ToolType from 'editor/ToolType';
import sendAction from 'utils/ajax';
import History from 'utils/History';

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
         * Do the given action.
         *
         * @param {String} action - See parseAction for format.
         */
        doAction(context, action) {
            let parsed = parseAction(action);
            if (has(this._actions, parsed.name)) {
                this.dispatch(parsed.name, parsed.data).then(() => {
                    History.addState(parsed.name, context.rootState);
                });
            } else if (has(this._mutations, parsed.name)) {
                this.commit(parsed.name, parsed.data);
                History.addState(parsed.name, context.rootState);
            } else {
                throw new Error(`Invalid action: ${parsed.name}`);
            }
        },
        /**
         * Redo an action.
         */
        redo() {
            History.redo();
        },
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
        /**
         * Undo an action.
         */
        undo() {
            History.undo();
        },
    },
};
