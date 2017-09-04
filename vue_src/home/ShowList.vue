<docs>
A list of shows for a tab.
</docs>

<template>
    <ul class="show-list">
        <li
            v-for="show in shows"
            v-bind:class="show.slug"
            @click="openShow($event, show)"
        >{{ show.name }}</li>
    </ul>
</template>

<script>
import { IS_STUNT } from "utils/env";

export default {
    props: ["shows"],
    methods: {
        /**
         * Open the given show.
         *
         * @param {Event} e - The click event. If ctrl or the meta key was
         *   pressed, opens the show in a new tab.
         * @param {Object} show - The show to open. If the show is owned
         *   by the current user or the current user is on STUNT, opens the
         *   show in the editor app. Otherwise, opens in the viewer app.
         */
        openShow(e, show) {
            let app = this.$parent.activeTab === "owned" || IS_STUNT
                ? "editor"
                : "viewer";
            this.$parent.openShow(app, show.slug, e.ctrlKey || e.metaKey);
        },
    },
};
</script>

<style lang="scss" scoped>
    .show-list {
        margin: 5px;
        background: $white;
        box-shadow: 0 0 5px $dark-gray;
        li {
            padding: 15px 20px 10px;
            cursor: pointer;
            border-bottom: 1px solid darken($semilight-gray, 10);
            &:hover, &.active {
                color: lighten($blue, 20);
                background: $white;
            }
            &:last-child {
                border-bottom: none;
            }
        }
    }
</style>
