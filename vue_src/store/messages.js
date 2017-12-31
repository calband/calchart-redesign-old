/**
 * @file Defines the Vuex module containing state relating to displaying
 *   messages.
 */

import { defaults, defaultTo, find, isString } from 'lodash';

import { findAndRemove } from 'utils/array';
import { uniqueId } from 'utils/JSUtils';

export default {
    namespaced: true,
    state: {
        messages: [],
    },
    mutations: {
        /**
         * Add a message to the message list.
         *
         * @param {Object} message
         */
        addMessage(state, message) {
            state.messages.push(message);
        },
        /**
         * Modify the message with the given ID.
         *
         * @param {Object}
         *   - {String} id - The ID of the message to modify.
         *   - {String} message - The new text of the message.
         */
        modifyMessage(state, { id, message }) {
            let data = find(state.messages, ['id', id]);
            data.message = message;
        },
        /**
         * Remove the message with the given ID from the message list.
         *
         * @param {String} id
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
            if (isString(payload)) {
                payload = { text: payload };
            }
            defaults(payload, {
                id: uniqueId(),
                error: false,
                autohide: undefined,
            });
            payload.autohide = defaultTo(payload.autohide, !payload.error);
            context.commit('addMessage', payload);

            if (payload.autohide) {
                setTimeout(() => {
                    context.commit('removeMessage', payload.id);
                }, 1000);
            }
        },
        /**
         * Shows an error message on the page. See showMessage.
         */
        showError(context, payload) {
            if (isString(payload)) {
                payload = { text: payload };
            }
            payload.error = true;
            context.dispatch('showMessage', payload);
        },
    },
};
