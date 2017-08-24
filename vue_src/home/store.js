import Vue from "vue"
import Vuex from "vuex"

import { IS_STUNT } from "utils/env";

Vue.use(Vuex);

// Convert tabs from an array of tuples into an object
const tabs = {};
window.tabs.forEach(([name, label]) => {
    tabs[name] = {
        label,
        shows: null, // to be set with loadTab
    };
});

/**
 * The shared state for the home page.
 */
export default new Vuex.Store({
    state: {
        isLoading: true,
        tabs,
        activeTab: window.tabs[0][0],
        isStunt: IS_STUNT,
    },
    getters: {
        shows: (state) => state.tabs[state.activeTab].shows,
    },
    mutations: {
        setLoaded(state) {
            state.isLoading = false;
        },
        saveShow(state, tab, shows) {
            state.tabs[tab].shows = shows;
        },
    },
    actions: {
        loadTab(context, tab) {
            return $.ajax({
                data: { tab },
                dataType: "json",
                success: data => {
                    // if band and is stunt, split shows into unpublished/published
                    context.commit("saveShow", tab, data.shows);
                    context.commit("setLoaded");
                },
            });
        },
    },
});

// // actions are functions that cause side effects and can involve
// // asynchronous operations.
// const actions = {
//   increment: ({ commit }) => commit('increment'),
//   decrement: ({ commit }) => commit('decrement'),
//   incrementIfOdd ({ commit, state }) {
//     if ((state.count + 1) % 2 === 0) {
//       commit('increment')
//     }
//   },
//   incrementAsync ({ commit }) {
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         commit('increment')
//         resolve()
//       }, 1000)
//     })
//   }
// }

// // getters are functions
// const getters = {
//   evenOrOdd: state => state.count % 2 === 0 ? 'even' : 'odd'
// }

// // A Vuex instance is created by combining the state, mutations, actions,
// // and getters.
// export default new Vuex.Store({
//   state,
//   getters,
//   actions,
//   mutations
// });
