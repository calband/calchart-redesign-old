<doc>
The top menu in the editor application.
</doc>

<template>
    <div class="menu">
        <EditorMenuTab label="File">
            <EditorMenuItem
                label="New stuntsheet"
                action="showAddSheet"
                icon="file-o"
                context="graph"
            />
            <EditorMenuItem
                label="Rename show"
                action="promptRename"
            />
            <EditorMenuItem
                label="Save"
                action="saveShow"
                icon="floppy-o"
            />
            <EditorMenuItem
                label="Generate PDF"
                action="generatePoopsheet"
                icon="file-pdf-o"
            />
            <EditorMenuItem
                label="Export"
                action="export"
                icon="file-code-o"
            />
            <EditorMenuItemDivider />
            <EditorMenuItem
                label="Preferences"
                action="editPreferences"
            />
            <EditorMenuItem
                label="Edit show properties"
                action="editShowProperties"
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
        <EditorMenuTab label="View">
            <EditorMenuItem label="View mode">
                <EditorMenuItem
                    label="Music editor"
                    action="loadContext(music)"
                    icon="music"
                />
                <EditorMenuItem
                    label="Dot editor"
                    action="loadContext(dot)"
                    icon="dot-circle-o"
                />
                <EditorMenuItem
                    label="Continuity editor"
                    action="loadContext(continuity)"
                    icon="pencil-square-o"
                />
                <!--
                <EditorMenuItem
                    label="3D view"
                    action="loadContext(3D)"
                />
                -->
                <EditorMenuItem
                    label="Open in viewer..."
                    action="openViewer"
                />
            </EditorMenuItem>
            <EditorMenuItem
                label="Toggle sheet background"
                action="toggleBackground"
                context="dot"
            />
            <EditorMenuItemDivider />
            <EditorMenuItem label="Zoom" icon="search" context="graph">
                <EditorMenuItem
                    label="Zoom in"
                    action="zoomBy(0.1)"
                    icon="search-plus"
                />
                <EditorMenuItem
                    label="Zoom out"
                    action="zoomBy(-0.1)"
                    icon="search-minus"
                />
                <EditorMenuItemDivider />
                <EditorMenuItem
                    v-for="zoom in ZOOMS"
                    :label="`${zoom * 100}%`"
                    :action="`zoomTo(${zoom})`"
                    :key="zoom"
                />
            </EditorMenuItem>
        </EditorMenuTab>
        <EditorMenuTab label="Help">
            <EditorMenuItem
                label="Go to help..."
                action="openHelp"
                icon="question-circle"
            />
        </EditorMenuTab>
    </div>
</template>

<script>
import $ from 'jquery';
import { isNull } from 'lodash';

import { ZOOMS } from 'utils/CalchartUtils';
import History from 'utils/History';

import EditorMenuTab from './EditorMenuTab';
import EditorMenuItem from './EditorMenuItem';
import EditorMenuItemDivider from './EditorMenuItemDivider';

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
        EditorMenuItemDivider,
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
    constants: {
        ZOOMS,
    },
    computed: {
        /**
         * @return {Boolean} true if the history has a redo action.
         */
        hasRedo() {
            return History.hasRedo;
        },
        /**
         * @return {Boolean} true if the history has an undo action.
         */
        hasUndo() {
            return History.hasUndo;
        },
        /**
         * @return {String} The label for the redo action.
         */
        redoLabel() {
            return History.redoLabel;
        },
        /**
         * @return {String} The label for the undo action.
         */
        undoLabel() {
            return History.undoLabel;
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
    margin: 2px 0;
    padding-left: 10px;
    z-index: z-index(menu);
}
</style>
