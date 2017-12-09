/**
 * @file Defines a Vuex Store that will store application-wide data.
 */

import Vue from 'vue';
import Vuex from 'vuex';

import editor from 'store/editor';
import env from 'store/env';
import messages from 'store/messages';

Vue.use(Vuex);

export default new Vuex.Store({
    plugins: [
        store => editor.$init(store),
    ],
    state: {
        // the Show loaded in the current page (or null if none loaded)
        show: null,
    },
    mutations: {
        /**
         * Set the show from the given show data.
         *
         * @param {?Show} show
         */
        setShow(state, show) {
            state.show = show;
        },
    },
    modules: {
        editor,
        env,
        messages,
    },
});
