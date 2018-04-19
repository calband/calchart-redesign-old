<docs>
The entry point for the editor page.
</docs>

<template>
    <div class="editor-view">
        <div class="editor-header">
            <router-link class="icon-link" to="/">
                <img :src="iconPath">
            </router-link>
            <h1 v-if="hasShow">{{ show.name }}</h1>
        </div>
        <component :is="component" />
    </div>
</template>

<script>
import { isNull } from 'lodash';

export default {
    name: 'Editor',
    props: {
        component: {
            // The component to render
            type: null,
            required: true,
        },
    },
    computed: {
        /**
         * @return {boolean} Whether a show is loaded.
         */
        hasShow() {
            return !isNull(this.show);
        },
        /**
         * @return {string} The path to the highstepper icon.
         */
        iconPath() {
            let staticPath = this.$store.state.env.staticPath;
            return `${staticPath}/img/highstepper.png`;
        },
        /**
         * Get the loaded Show.
         *
         * @return {?Show}
         */
        show() {
            return this.$store.state.show;
        },
    },
};
</script>

<style lang="scss" scoped>
.editor-header {
    $header-font-size: 24px;
    padding: 5px 10px;
    background: $light-gray;
    .icon-link {
        display: inline-block;
        margin-right: 15px;
        img {
            height: $header-font-size * 1.25;
        }
    }
    h1 {
        display: inline-block;
        margin: 0;
        font-size: $header-font-size;
        vertical-align: bottom;
    }
}
</style>
