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
                :class="{ message: true, error: message.error }"
            >{{ message.text }}</li>
        </ul>
        <router-view></router-view>
    </div>
</template>

<script>
export default {
    name: 'Calchart',
    data() {
        return {
            messages: [],
        };
    },
    methods: {
        /**
         * Shows a message on the page.
         *
         * @param {String} message
         * @param {boolean} error - true to style the message as an error
         */
        showMessage(message, error=false) {
            this.messages.push({
                text: message,
                error: error,
            });
            // TODO: remove after time
        },
        /**
         * Shows an error message on the page.
         *
         * @param {String} message
         */
        showError(message) {
            this.showMessage(message, true);
        }
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
