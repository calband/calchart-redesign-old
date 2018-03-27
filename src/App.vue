<docs>
The primary endpoint for the Calchart pages. Routes to the appropriate
page according to the URL.
</docs>

<template>
    <div id="app" :class="$route.name">
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
                    class="icon-times close-message"
                    @click="removeMessage(message.id)"
                />
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

<style lang="scss" src="./scss/base.scss"></style>
