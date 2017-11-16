/**
 * @file Defines a Vuex Store that will store application-wide data.
 */

import _ from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';

import sendAction from 'utils/ajax';
import { findAndRemove } from 'utils/array';

Vue.use(Vuex);

/**
 * The module containing state relating to the editor.
 */
const editor = {
    namespaced: true,
    state: {
        // data for creating a new show
        newShowData: null,
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

/**
 * The module containing state relating to the environment.
 */
const env = {
    namespaced: true,
    state: {
        // The CSRF token for POST requests
        csrfToken: window.env.csrf_token,
        // true if working on the development site
        isLocal: window.env.is_local,
        // true if the user is on a Mac
        // https://css-tricks.com/snippets/javascript/test-mac-pc-javascript/
        isMac: navigator.userAgent.includes('Mac OS X'),
        // true if the current user is on Stunt
        isStunt: window.env.is_stunt,
        // the path to static files, without a trailing slash
        staticPath: window.env.static_path,
    },
};

/**
 * The module containing state relating to displaying messages.
 */
const messages = {
    namespaced: true,
    state: {
        messages: [],
        messageId: 0,
    },
    mutations: {
        /**
         * Add a message to the message list.
         *
         * @param {Object} message
         */
        addMessage(state, message) {
            state.messageId++;
            message.id = state.messageId;
            state.messages.push(message);
        },
        /**
         * Remove the message with the given ID from the message list.
         *
         * @param {int} id
         */
        removeMessage(state, id) {
            findAndRemove(state.messages, ['id', id]);
        },
    },
    actions: {
        /**
         * Shows a message on the page. Can either provide just the message text
         * or an object containing the message and options.
         *
         * @param {String} text
         * @param {boolean} [error=false] - true if message is an error message
         * @param {boolean} [autohide=!error] - Automatically hide the message
         *   after a given time.
         */
        showMessage(context, payload) {
            if (_.isString(payload)) {
                payload = { text: payload };
            }
            _.defaults(payload, {
                error: false,
                autohide: undefined,
            });
            payload.autohide = _.defaultTo(payload.autohide, !payload.error);
            context.commit('addMessage', payload);
            let id = context.state.messageId;

            if (payload.autohide) {
                setTimeout(() => {
                    context.commit('removeMessage', id);
                }, 1000);
            }
        },
        /**
         * Shows an error message on the page. See showMessage.
         */
        showError(context, payload) {
            if (_.isString(payload)) {
                payload = { text: payload };
            }
            payload.error = true;
            context.dispatch('showMessage', payload);
        },
    },
};

export default new Vuex.Store({
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
