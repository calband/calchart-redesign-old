/**
 * @file Defines a Vuex Store that will store application-wide data.
 */

import Vue from 'vue';
import Vuex from 'vuex';

// import editor from './editor';
import env from './env';
import messages from './messages';

Vue.use(Vuex);

export default new Vuex.Store({
    plugins: [
        // store => editor.$init(store),
    ],
    state: {
        // the Show loaded in the current page (or null if none loaded)
        show: null,
    },
    mutations: {
        /**
         * Modify the Show with the given arguments.
         *
         * Takes in an object in the Show to be updated (defaults to the Show
         * itself). This target should have been freshly retrieved from the Show
         * in the store, since `modifyShow` is supposed to actually change the
         * state, but this is not checked.
         *
         * @param {Object}
         *  | {Any} target
         *  | {string} func - The name of the function to call on the target.
         *  | {Array} args - Arguments to pass to the function.
         */
        modifyShow(state, { target, func, args }) {
            target = target || state.show;
            target[func].apply(target, args);
        },
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
        // editor,
        env,
        messages,
    },
});
