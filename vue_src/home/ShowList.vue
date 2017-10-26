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
        v-if="isOwned"
        @click="openShow('editor', activeShow.slug)"
    >Open in editor</li>
    <li
        @click="openShow('viewer', activeShow.slug)"
    >Open in viewer</li>
    <li
        v-if="$parent.showPublished"
        @click="$parent.togglePublished(activeShow)"
    >{{ activeShow.published|togglePublishedLabel }}</li>
</context-menu>

<script>
import _ from 'lodash';

import { IS_STUNT } from 'utils/env';
import { validateList, validateObject } from 'utils/validators';

export default {
    props: {
        shows: {
            type: Array,
            validator: validateList(validateObject('slug', 'name', 'published')),
            required: true,
        },
    },
    data() {
        return {
            _activeShow: null,
        };
    },
    computed: {
        /**
         * @return {boolean} true if the current show list is a list
         *   of shows that are owned by the user.
         */
        isOwned() {
            return this.$parent.activeTab === 'owned' || IS_STUNT;
        },
        /**
         * @return {Object}
         */
        activeShow() {
            return _.isNull(this.$data._activeShow) ? {} : this.$data._activeShow;
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
         * Hook that runs when the context menu is hidden.
         */
        onContextMenuHide() {
            this.$data._activeShow = null;
        },
        /**
         * Open a context menu for the given show.
         *
         * @param {Event} e
         * @param {Object} show
         */
        openContextMenu(e, show) {
            // TODO: keep show `.active`
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
            let app = this.isOwned ? 'editor' : 'viewer';
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
                // TODO: use router
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
    filters: {
        /**
         * @return {string} If the show is published, display 'Unpublish',
         *   otherwise display 'Publish'.
         */
        togglePublishedLabel(isPublished) {
            return isPublished ? 'Unpublish' : 'Publish';
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
