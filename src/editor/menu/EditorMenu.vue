<doc>
The top menu in the editor application.
</doc>

<template>
    <div class="menu">
        <EditorMenuTab label="File">
            <EditorMenuItem
                label="Save"
                action="saveShow"
                icon="floppy-o"
            />
        </EditorMenuTab>
        <EditorMenuTab label="Edit">
            <EditorMenuItem
                :label="`Undo ${undoLabel}`"
                :disabled="!hasUndo"
                action="undo"
                icon="undo"
            />
            <EditorMenuItem
                :label="`Redo ${redoLabel}`"
                :disabled="!hasRedo"
                action="redo"
                icon="repeat"
            />
        </EditorMenuTab>
    </div>
</template>

<script>
import $ from 'jquery';
import { isNull } from 'lodash';

import { getHistory } from 'store/editor';

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
        /**
         * @return {Boolean} true if the history has a redo action.
         */
        hasRedo() {
            return getHistory().hasRedo;
        },
        /**
         * @return {Boolean} true if the history has an undo action.
         */
        hasUndo() {
            return getHistory().hasUndo;
        },
        /**
         * @return {String} The label for the redo action.
         */
        redoLabel() {
            return getHistory().redoLabel;
        },
        /**
         * @return {String} The label for the undo action.
         */
        undoLabel() {
            return getHistory().undoLabel;
        },
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
