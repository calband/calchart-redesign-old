<docs>
A list of shows for a tab.
</docs>

<template>
    <ul class="show-list">
        <li
            v-for="show in shows"
            :class="[show.slug, getActiveClass(show)]"
            :key="show.slug"
            @click.left="openDefaultShow($event, show)"
            @contextmenu.prevent="openContextMenu($event, show)"
        >{{ show.name }}</li>
    </ul>
</template>

<context-menu>
    <li
        v-if="isOwner"
        @click="openShow('editor', activeShow.slug)"
    >Open in editor</li>
    <li
        @click="openShow('viewer', activeShow.slug)"
    >Open in viewer</li>
    <li
        v-if="canPublish"
        @click="$emit('publish', activeShow)"
    >{{ activeShow.published|togglePublishedLabel }}</li>
</context-menu>

<script>
import { defaultTo } from 'lodash';

import { validateType } from 'utils/types';

export default {
    props: {
        shows: {
            type: Array,
            validator: validateType({
                _type: 'array',
                _wraps: {
                    slug: 'string',
                    name: 'string',
                    published: 'boolean',
                },
            }),
            required: true,
        },
        isOwner: {
            type: Boolean,
            required: true,
        },
        canPublish: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            _activeShow: null, // eslint-disable-line vue/no-reserved-keys
        };
    },
    mounted() {
        this.contextMenu.$on('hide', () => {
            this.$data._activeShow = null;
        });
    },
    filters: {
        /**
         * @return {string} If the show is published, display 'Unpublish',
         *   otherwise display 'Publish'.
         */
        togglePublishedLabel(isPublished) {
            return isPublished ? 'Unpublish' : 'Publish';
        },
    },
    computed: {
        /**
         * @return {Object}
         */
        activeShow() {
            return defaultTo(this.$data._activeShow, {});
        },
    },
    methods: {
        /**
         * Return a class Object that adds the 'active' class if the given show
         * is the active show.
         *
         * @param {Object} show
         * @return {Object}
         */
        getActiveClass(show) {
            return {
                active: this.$data._activeShow === show,
            };
        },
        /**
         * Open a context menu for the given show.
         *
         * @param {Event} e
         * @param {Object} show
         */
        openContextMenu(e, show) {
            this.$data._activeShow = show;
            this.contextMenu.open(e);
        },
        /**
         * Open the given show with default options.
         *
         * @param {Event} e - The click event. If ctrl or the meta key was
         *   pressed, opens the show in a new tab.
         * @param {Object} show - The show to open. If the show is owned
         *   by the current user or the current user is on STUNT, opens the
         *   show in the editor app. Otherwise, opens in the viewer app.
         */
        openDefaultShow(e, show) {
            let app = this.isOwner ? 'editor' : 'viewer';
            this.openShow(app, show.slug, e.ctrlKey || e.metaKey);
        },
        /**
         * Open the given show in the given app.
         *
         * @param {string} app - The application to load; 'viewer' or 'editor'
         * @param {string} slug - The slug of the show to open
         * @param {boolean} [newTab=false] - true to open the show in a new tab
         */
        openShow(app, slug, newTab=false) {
            if (newTab) {
                let url = `/${app}/${slug}`;
                window.open(url, '_blank');
            } else {
                this.$router.push({
                    name: app,
                    params: { slug },
                });
            }
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
        border-bottom: 1px solid $light-gray-darker;
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
