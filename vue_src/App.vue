<docs>
The primary endpoint for the Calchart pages. Routes to the appropriate
page according to the URL.
</docs>

<template>
    <div>
        <header>
            <h1><router-link :to="{ name: 'home' }">Calchart</router-link></h1>
            <p class="logout-link"><a href="/logout">Logout</a></p>
        </header>
        <ul
            v-if="messages.length > 0"
            class="messages"
        >
            <li
                v-for="message in messages"
                :class="['message', { error: message.error }]"
            >{{ message.text }}
                <i
                    v-if="!message.autohide"
                    @click="hideMessage(message.id)"
                    class="icon-times close-message"
                ></i>
            </li>
        </ul>
        <router-view></router-view>
    </div>
</template>

<script>
import _ from 'lodash';

export default {
    name: 'Calchart',
    data() {
        return {
            messages: [],
            messageId: 0,
        };
    },
    methods: {
        /**
         * Shows a message on the page.
         *
         * @param {String} message
         * @param {Object} [options] - Options to customize the message:
         *   - {boolean} [error=false] - true if message is an error message
         *   - {boolean} [autohide=!isError] - Automatically hide the message after
         *     a given time.
         * @param {boolean} error - true to style the message as an error
         */
        showMessage(message, options={}) {
            _.defaults(options, {
                error: false,
            })
            options.autohide = _.defaultTo(options.autohide, !options.error);
            options.id = this.messageId++;
            options.text = message;
            this.messages.push(options);

            if (options.autohide) {
                setTimeout(() => {
                    this.hideMessage(options.id);
                }, 1000);
            }
        },
        /**
         * Shows an error message on the page.
         *
         * @param {String} message
         * @param {Object} [options]
         */
        showError(message, options={}) {
            options.error = true;
            this.showMessage(message, options);
        },
        /**
         * Hide the message with the given id.
         *
         * @param {int} id
         */
        hideMessage(id) {
            let index = _.findIndex(this.messages, ['id', id]);
            this.messages.splice(index, 1);
        },
    },
};
</script>

<style lang="scss">
    .vue-context-menu {
        @include hover-menu;
    }
</style>

<style lang="scss" scoped>
    .messages {
        @include hover-messages;
    }
</style>
