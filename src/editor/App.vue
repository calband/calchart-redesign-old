<docs>
The entry point for the editor page.
</docs>

<template>
    <div class="editor-view">
        <div class="editor-header">
            <router-link class="icon-link" to="/">
                <img :src="iconPath">
            </router-link>
            <h1>{{ show.name }}</h1>
        </div>
    </div>
</template>

<script>
import { isNull } from 'lodash';

export default {
    name: 'Editor',
    computed: {
        /**
         * @return {string} The path to the highstepper icon.
         */
        iconPath() {
            let staticPath = this.$store.state.env.staticPath;
            return `${staticPath}/img/highstepper.png`;
        },
        /**
         * @return {boolean}
         */
        isInitialized() {
            return !isNull(this.$store.state.show);
        },
        /**
         * Get either the loaded Show or the data for creating a new show.
         *
         * @return {Show|object}
         */
        show() {
            if (this.isInitialized) {
                return this.$store.state.show;
            } else {
                return this.$store.state.editor.newShowData;
            }
        },
    },
};
</script>

<style lang="scss">
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
