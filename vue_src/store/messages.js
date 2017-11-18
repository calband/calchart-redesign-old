/**
 * @file Defines the Vuex module containing state relating to displaying
 *   messages.
 */

import _ from 'lodash';

import { findAndRemove } from 'utils/array';

export default {
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
