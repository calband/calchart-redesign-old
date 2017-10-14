<docs>
The primary endpoint for the Calchart pages. Routes to the appropriate
page according to the URL.
</docs>

<template>
    <div>
        <header>
            <h1><a href="{% url 'home' %}">Calchart</a></h1>
            <p class="logout-link"><a href="{% url 'logout' %}">Logout</a></p>
        </header>
        <ul
            v-if="messages.length > 0"
            v-for="message in messages"
            class="messages"
        >
            <li>{{ message.text }}</li>
        </ul>
        <router-view></router-view>
    </div>
</template>

<script>
export default {
    name: "Calchart",
    data() {
        return {
            messageId: 0,
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
                id: this.messageId,
                text: message,
            });
            this.messageId++;
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

<style lang="scss" scoped>
    .messages {
        @include hover-messages;
    }
</style>
