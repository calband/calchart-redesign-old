<docs>
The primary endpoint for the Calchart pages. Routes to the appropriate
page according to the URL.
</docs>

<template>
    <div id="app" :class="$route.name">
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
body {
    padding: 0;
    overflow: hidden;
}

.vue-context-menu {
    @include hover-menu;
}

.tooltip {
    position: absolute;
    background: $black;
    color: $white;
    padding: 5px 7px;
    font-size: 14px;
    z-index: z-index(tooltip);
    .tooltip-arrow {
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border: 5px solid transparent;
        border-top-color: $black;
    }
}
</style>

<style lang="scss" scoped>
.messages {
    @include hover-messages;
}
</style>
