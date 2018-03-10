/**
 * @file Defines a Vuex Store that will store application-wide data.
 */

import Vue from 'vue';
import Vuex from 'vuex';

import env from 'store/env';
import messages from 'store/messages';

Vue.use(Vuex);

export default new Vuex.Store({
    // plugins: [
    //     store => editor.$init(store),
    // ],
    state: {
        // the Show loaded in the current page (or null if none loaded)
        show: null,
    },
    mutations: {
        /**
         * Modify the Show with the given arguments.
         *
         * @param {Object}
         *   - {*} target - An object in the Show object to be updated (defaults
         *     to the Show itself). This target should have been freshly
         *     retrieved from the Show in the state, since `modifyShow` is
         *     supposed to actually change the state, but this is not checked.
         *   - {String} func - The name of the function to call.
         *   - {[*]} args - Arguments to pass to the function.
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
