/**
 * @file Defines a Vuex Store that will store application-wide data.
 */

import Vuex from 'vuex';

import editor from './editor';
import env from './env';
import messages from './messages';

let STORE = null;

/**
 * Initialize the Vuex store.
 *
 * @param {Vue} Vue
 * @return {Vuex.Store}
 */
export default function initStore(Vue) {
    Vue.use(Vuex);
    STORE = new Vuex.Store({
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
    return STORE;
}

/**
 * Get the Vuex store, or null if it's not initialized yet.
 *
 * @return {?Vuex.Store}
 */
export function getStore() {
    return STORE;
}
