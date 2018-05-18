<doc>
The top menu in the editor application.
</doc>

<template>
    <div class="menu">
        <EditorMenuTab label="File">
            <EditorMenuItem
                label="Save"
                action="saveShow"
                icon="save"
            />
        </EditorMenuTab>
        <EditorMenuTab label="Edit">
            <EditorMenuItem
                :label="`Undo ${history.undoLabel}`"
                :disabled="!history.hasUndo"
                action="undo"
                icon="undo"
            />
            <EditorMenuItem
                :label="`Redo ${history.redoLabel}`"
                :disabled="!history.hasRedo"
                action="redo"
                icon="redo"
            />
        </EditorMenuTab>
    </div>
</template>

<script>
import $ from 'jquery';
import { includes, isNull } from 'lodash';
import { mapGetters } from 'vuex';

import EditorMenuTab from './EditorMenuTab';
import EditorMenuItem from './EditorMenuItem';

/**
 * @param {Event} e
 * @return {Boolean} True if the event was triggered on a menu tab.
 */
function isOnTab(e) {
    return $(e.target).parent().hasClass('menu-tab');
}

export default {
    components: {
        EditorMenuTab,
        EditorMenuItem,
    },
    data() {
        return {
            activeTab: null,
        };
    },
    created() {
        // force re-render for History
        let historyActions = [
            'editor/modifyShow',
            'editor/undo',
            'editor/redo',
        ];

        let forceUpdate = action => {
            if (includes(historyActions, action.type)) {
                this.$forceUpdate();
            }
        };

        this.$store.subscribe(forceUpdate);
        this.$store.subscribeAction(forceUpdate);
    },
    mounted() {
        $('body').append(this.$refs.background);

        this.$children.forEach(menuTab => {
            menuTab.$on('mouseover', () => {
                if (this.activeTab && this.activeTab !== menuTab) {
                    this.activate(menuTab);
                }
            });
            menuTab.$on('mousedown', e => {
                if (isNull(this.activeTab)) {
                    this.activate(menuTab);
                } else if (isOnTab(e)) {
                    this.deactivate();
                }
            });
        });
    },
    computed: {
        ...mapGetters('editor', ['history']),
    },
    methods: {
        /**
         * Activate the given menu tab.
         */
        activate(menuTab) {
            this.deactivate();
            menuTab.activate();
            this.activeTab = menuTab;

            $(document).on('mouseup.menu', e => {
                // clicking on a tab is handled in the mousedown event; we want
                // to avoid capturing the mouseup event when clicking on a tab
                // (e.g. when initially opening the tab).
                if (!isOnTab(e)) {
                    this.deactivate();
                }
            });
        },
        /**
         * Deactivate the active menu tab.
         */
        deactivate() {
            if (this.activeTab) {
                this.activeTab.deactivate();
                this.activeTab = null;
            }

            $(document).off('.menu');
        },
    },
};
</script>

<style lang="scss" scoped>
.menu {
    @include unselectable;
    display: inline-block;
    position: absolute;
    right: 10px;
    z-index: z-index(header);
}
</style>
