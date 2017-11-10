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
                :key="message.id"
                :class="['message', { error: message.error }]"
            >{{ message.text }}
                <i
                    v-if="!message.autohide"
                    @click="removeMessage(message.id)"
                    class="icon-times close-message"
                ></i>
            </li>
        </ul>
        <router-view />
    </div>
</template>

<script>
import _ from 'lodash';
import { mapState, mapMutations } from 'vuex';

export default {
    name: 'Calchart',
    computed: {
        ...mapState('messages', ['messages']),
    },
    methods: {
        ...mapMutations('messages', ['removeMessage']),
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
