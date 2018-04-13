<docs>
The entry point for the editor page.
</docs>

<template>
    <div class="editor-view">
        <div class="editor-header">
            <router-link class="icon-link" to="/">
                <img :src="iconPath">
            </router-link>
            <h1 v-if="!create">{{ show.name }}</h1>
        </div>
        <CreateShow v-if="create" />
        <div v-else>TODO</div>
    </div>
</template>

<script>
import CreateShow from './CreateShow';

export default {
    name: 'Editor',
    props: {
        create: {
            // If true, a show is being created.
            type: Boolean,
            required: true,
        },
    },
    components: {
        CreateShow,
    },
    computed: {
        /**
         * @return {string} The path to the highstepper icon.
         */
        iconPath() {
            let staticPath = this.$store.state.env.staticPath;
            return `${staticPath}/img/highstepper.png`;
        },
        /**
         * Get either the loaded Show or the data for creating a new show.
         *
         * @return {Show|object}
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
